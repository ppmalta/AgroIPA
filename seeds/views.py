from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SeedType, Warehouse, Stock, Batch, StockMovement, SeedRequest
from .serializers import SeedTypeSerializer, WarehouseSerializer, StockSerializer, BatchSerializer, StockMovementSerializer, SeedRequestSerializer
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from datetime import date, timedelta

class SeedTypeViewSet(viewsets.ModelViewSet):
    queryset = SeedType.objects.all()
    serializer_class = SeedTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'scientific_name', 'category']
    ordering_fields = ['name', 'category', 'created_at']


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['warehouse', 'seed_type']


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        batches = Batch.objects.filter(status='available').order_by('expiration_date')
        serializer = BatchSerializer(batches, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)


class SeedRequestViewSet(viewsets.ModelViewSet):
    queryset = SeedRequest.objects.all()
    serializer_class = SeedRequestSerializer

    def perform_create(self, serializer):
        import uuid
        request_number = f"SR-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(requester=self.request.user, request_number=request_number)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        seed_request = self.get_object()
        seed_request.status = 'approved'
        seed_request.approved_by = request.user
        seed_request.approved_date = date.today()
        seed_request.save()
        serializer = self.get_serializer(seed_request)
        return Response(serializer.data)
