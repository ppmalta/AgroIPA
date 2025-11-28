"""
AgroIPA - Views de Inventário
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, F
from .models import Species, Supplier, Municipality, Warehouse, Lot, Stock, StockMovement
from .serializers import (
    SpeciesSerializer, SupplierSerializer, MunicipalitySerializer,
    WarehouseSerializer, LotListSerializer, LotDetailSerializer,
    LotCreateSerializer, StockSerializer, StockMovementSerializer,
    StockTransferSerializer
)
from users.permissions import IsGestorOrReadOnly, IsOperador


class SpeciesViewSet(viewsets.ModelViewSet):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    permission_classes = [IsAuthenticated, IsGestorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    search_fields = ['name', 'scientific_name']


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, IsGestorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    search_fields = ['name', 'cnpj']


class MunicipalityViewSet(viewsets.ModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAuthenticated, IsGestorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['state', 'is_active']
    search_fields = ['name', 'code_ibge']


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated, IsGestorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['municipality', 'is_active']
    search_fields = ['name', 'code']

    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Retorna o estoque detalhado do armazém"""
        warehouse = self.get_object()
        stocks = Stock.objects.filter(warehouse=warehouse).select_related('lot', 'lot__species')
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumo de estoque por armazém"""
        warehouses = Warehouse.objects.filter(is_active=True).annotate(
            total_stock=Sum('stock_items__quantity')
        )
        data = [
            {
                'id': w.id,
                'name': w.name,
                'code': w.code,
                'capacity': w.capacity,
                'current_stock': w.total_stock or 0,
                'utilization': round((w.total_stock or 0) / w.capacity * 100, 2) if w.capacity > 0 else 0
            }
            for w in warehouses
        ]
        return Response(data)


class LotViewSet(viewsets.ModelViewSet):
    queryset = Lot.objects.all()
    permission_classes = [IsAuthenticated, IsOperador]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['species', 'supplier', 'status']
    search_fields = ['lot_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return LotCreateSerializer
        if self.action == 'retrieve':
            return LotDetailSerializer
        return LotListSerializer

    @action(detail=True, methods=['get'])
    def trace(self, request, pk=None):
        """Retorna histórico completo do lote para rastreabilidade"""
        lot = self.get_object()
        movements = lot.movements.select_related(
            'warehouse_origin', 'warehouse_destination', 'created_by'
        ).order_by('created_at')

        # Constrói linha do tempo
        timeline = []
        for mov in movements:
            timeline.append({
                'date': mov.created_at,
                'type': mov.get_movement_type_display(),
                'origin': mov.warehouse_origin.name if mov.warehouse_origin else None,
                'destination': mov.warehouse_destination.name if mov.warehouse_destination else None,
                'quantity': mov.quantity,
                'responsible': mov.created_by.get_full_name() if mov.created_by else None,
                'notes': mov.notes
            })

        # Adiciona entregas
        deliveries = lot.deliveries.select_related(
            'expedition', 'expedition__destination', 'farmer'
        ).order_by('delivered_at')

        for delivery in deliveries:
            timeline.append({
                'date': delivery.delivered_at,
                'type': 'Entrega',
                'origin': None,
                'destination': delivery.expedition.destination.name if delivery.expedition.destination else 'Agricultor',
                'quantity': delivery.quantity,
                'responsible': delivery.delivered_by.get_full_name() if delivery.delivered_by else None,
                'farmer': delivery.farmer.name if delivery.farmer else None,
                'notes': delivery.notes
            })

        # Ordena por data
        timeline.sort(key=lambda x: x['date'])

        return Response({
            'lot': LotDetailSerializer(lot).data,
            'timeline': timeline
        })

    @action(detail=True, methods=['post'], permission_classes=[IsOperador])
    def adjust_status(self, request, pk=None):
        """Ajusta o status do lote manualmente"""
        lot = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(Lot.Status.choices):
            return Response(
                {'error': 'Status inválido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lot.status = new_status
        lot.save()

        return Response({'message': f'Status alterado para {lot.get_status_display()}.'})


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsOperador]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lot', 'movement_type', 'warehouse_origin', 'warehouse_destination']

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def transfer(self, request):
        """Realiza transferência entre armazéns"""
        serializer = StockTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        lot = data['lot']
        origin = data['warehouse_origin']
        destination = data['warehouse_destination']
        quantity = data['quantity']

        # Atualiza estoque origem
        stock_origin = Stock.objects.get(warehouse=origin, lot=lot)
        stock_origin.quantity -= quantity
        stock_origin.save()

        # Atualiza estoque destino
        stock_dest, created = Stock.objects.get_or_create(
            warehouse=destination,
            lot=lot,
            defaults={'quantity': 0}
        )
        stock_dest.quantity += quantity
        stock_dest.save()

        # Registra movimentação
        movement = StockMovement.objects.create(
            lot=lot,
            movement_type=StockMovement.MovementType.TRANSFERENCIA,
            warehouse_origin=origin,
            warehouse_destination=destination,
            quantity=quantity,
            notes=data.get('notes', ''),
            created_by=request.user
        )

        return Response(
            StockMovementSerializer(movement).data,
            status=status.HTTP_201_CREATED
        )
