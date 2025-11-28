"""
AgroIPA - Views de Logística
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import Farmer, SeedRequest, SeedRequestItem, Expedition, ExpeditionItem, Delivery
from .serializers import (
    FarmerSerializer, SeedRequestListSerializer, SeedRequestDetailSerializer,
    SeedRequestCreateSerializer, SeedRequestReviewSerializer,
    ExpeditionListSerializer, ExpeditionDetailSerializer, ExpeditionCreateSerializer,
    DeliverySerializer, DeliveryCreateSerializer
)
from users.permissions import IsGestor, IsAgente, IsOwnerOrGestor, IsSolicitante
from inventory.models import Stock, StockMovement


class FarmerViewSet(viewsets.ModelViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['municipality', 'organization', 'is_active']
    search_fields = ['name', 'cpf']


class SeedRequestViewSet(viewsets.ModelViewSet):
    queryset = SeedRequest.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'organization']
    search_fields = ['request_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return SeedRequestCreateSerializer
        if self.action == 'retrieve':
            return SeedRequestDetailSerializer
        return SeedRequestListSerializer

    def get_queryset(self):
        user = self.request.user
        # Gestores veem todas as solicitações
        if user.roles.filter(role='gestor').exists():
            return SeedRequest.objects.all()
        # Solicitantes veem apenas suas solicitações
        return SeedRequest.objects.filter(requester=user)

    @action(detail=True, methods=['post'], permission_classes=[IsGestor])
    def review(self, request, pk=None):
        """Aprova ou rejeita uma solicitação"""
        seed_request = self.get_object()
        serializer = SeedRequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        seed_request.status = data['status']
        seed_request.review_notes = data.get('review_notes', '')
        seed_request.reviewer = request.user
        seed_request.reviewed_at = timezone.now()
        seed_request.save()

        # Atualiza quantidades aprovadas se parcial
        if data['status'] == 'parcial' and 'items' in data:
            for item_data in data['items']:
                try:
                    item = seed_request.items.get(species_id=item_data['species'])
                    item.quantity_approved = item_data.get('quantity_approved')
                    item.save()
                except SeedRequestItem.DoesNotExist:
                    pass
        elif data['status'] == 'aprovada':
            # Aprova todas as quantidades solicitadas
            for item in seed_request.items.all():
                item.quantity_approved = item.quantity_requested
                item.save()

        return Response(SeedRequestDetailSerializer(seed_request).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela uma solicitação"""
        seed_request = self.get_object()

        # Verifica se o usuário pode cancelar
        if seed_request.requester != request.user and not request.user.roles.filter(role='gestor').exists():
            return Response(
                {'error': 'Você não tem permissão para cancelar esta solicitação.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if seed_request.status not in ['pendente', 'analise']:
            return Response(
                {'error': 'Solicitação não pode ser cancelada neste status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        seed_request.status = 'cancelada'
        seed_request.save()

        return Response({'message': 'Solicitação cancelada com sucesso.'})


class ExpeditionViewSet(viewsets.ModelViewSet):
    queryset = Expedition.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'destination', 'warehouse_origin']
    search_fields = ['expedition_number']

    def get_serializer_class(self):
        if self.action == 'create':
            return ExpeditionCreateSerializer
        if self.action == 'retrieve':
            return ExpeditionDetailSerializer
        return ExpeditionListSerializer

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def ship(self, request, pk=None):
        """Marca expedição como em trânsito e baixa estoque"""
        expedition = self.get_object()

        if expedition.status != 'pendente' and expedition.status != 'preparando':
            return Response(
                {'error': 'Expedição já foi enviada ou não pode ser alterada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Baixa estoque e registra movimentação
        for item in expedition.items.all():
            try:
                stock = Stock.objects.get(
                    warehouse=expedition.warehouse_origin,
                    lot=item.lot
                )
                if stock.quantity < item.quantity:
                    return Response(
                        {'error': f'Estoque insuficiente para o lote {item.lot.lot_number}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                stock.quantity -= item.quantity
                stock.save()

                StockMovement.objects.create(
                    lot=item.lot,
                    movement_type=StockMovement.MovementType.SAIDA,
                    warehouse_origin=expedition.warehouse_origin,
                    quantity=item.quantity,
                    reference=f"Expedição {expedition.expedition_number}",
                    created_by=request.user
                )
            except Stock.DoesNotExist:
                return Response(
                    {'error': f'Lote {item.lot.lot_number} não encontrado no armazém'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        expedition.status = 'transito'
        expedition.shipped_at = timezone.now()
        expedition.save()

        return Response(ExpeditionDetailSerializer(expedition).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marca expedição como entregue"""
        expedition = self.get_object()

        if expedition.status != 'transito':
            return Response(
                {'error': 'Expedição não está em trânsito.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        expedition.status = 'entregue'
        expedition.delivered_at = timezone.now()

        # Upload do comprovante se enviado
        if 'delivery_proof' in request.FILES:
            expedition.delivery_proof = request.FILES['delivery_proof']

        expedition.save()

        return Response(ExpeditionDetailSerializer(expedition).data)

    @action(detail=True, methods=['get'])
    def deliveries(self, request, pk=None):
        """Lista entregas da expedição"""
        expedition = self.get_object()
        deliveries = expedition.deliveries.all()
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)


class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    permission_classes = [IsAuthenticated, IsAgente]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['expedition', 'lot', 'farmer']

    def get_serializer_class(self):
        if self.action == 'create':
            return DeliveryCreateSerializer
        return DeliverySerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas de entregas"""
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate

        # Parâmetros de filtro
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        queryset = Delivery.objects.all()

        if start_date:
            queryset = queryset.filter(delivered_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(delivered_at__date__lte=end_date)

        # Total
        total = queryset.aggregate(
            total_quantity=Sum('quantity'),
            total_deliveries=Count('id'),
            total_farmers=Count('farmer', distinct=True)
        )

        # Por dia
        by_day = queryset.annotate(
            date=TruncDate('delivered_at')
        ).values('date').annotate(
            quantity=Sum('quantity'),
            count=Count('id')
        ).order_by('date')

        return Response({
            'summary': total,
            'by_day': list(by_day)
        })
