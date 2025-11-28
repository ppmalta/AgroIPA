"""
AgroIPA - Serializers de Logística
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Farmer, SeedRequest, SeedRequestItem, Expedition, ExpeditionItem, Delivery


class FarmerSerializer(serializers.ModelSerializer):
    municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = Farmer
        fields = [
            'id', 'name', 'cpf', 'phone', 'address',
            'municipality', 'municipality_name', 'dap_number',
            'organization', 'organization_name', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SeedRequestItemSerializer(serializers.ModelSerializer):
    species_name = serializers.CharField(source='species.name', read_only=True)

    class Meta:
        model = SeedRequestItem
        fields = [
            'id', 'species', 'species_name',
            'quantity_requested', 'quantity_approved'
        ]


class SeedRequestListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = SeedRequest
        fields = [
            'id', 'request_number', 'requester', 'requester_name',
            'organization', 'organization_name', 'status', 'status_display',
            'beneficiaries_count', 'items_count', 'priority', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class SeedRequestDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    items = SeedRequestItemSerializer(many=True, read_only=True)

    class Meta:
        model = SeedRequest
        fields = [
            'id', 'request_number', 'requester', 'requester_name',
            'organization', 'organization_name', 'status', 'status_display',
            'justification', 'beneficiaries_count', 'priority',
            'reviewer', 'reviewer_name', 'review_notes', 'reviewed_at',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['request_number', 'created_at', 'updated_at']


class SeedRequestCreateSerializer(serializers.ModelSerializer):
    items = SeedRequestItemSerializer(many=True)

    class Meta:
        model = SeedRequest
        fields = [
            'organization', 'justification', 'beneficiaries_count', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        # Gera número da solicitação
        from django.utils import timezone
        now = timezone.now()
        count = SeedRequest.objects.filter(
            created_at__year=now.year
        ).count() + 1
        request_number = f"SOL-{now.year}-{count:05d}"

        request = SeedRequest.objects.create(
            request_number=request_number,
            requester=user,
            **validated_data
        )

        for item_data in items_data:
            SeedRequestItem.objects.create(request=request, **item_data)

        return request


class SeedRequestReviewSerializer(serializers.Serializer):
    """Serializer para aprovação/rejeição de solicitações"""
    status = serializers.ChoiceField(choices=[
        ('aprovada', 'Aprovada'),
        ('parcial', 'Parcialmente Aprovada'),
        ('rejeitada', 'Rejeitada'),
    ])
    review_notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )


class ExpeditionItemSerializer(serializers.ModelSerializer):
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    species_name = serializers.CharField(source='lot.species.name', read_only=True)

    class Meta:
        model = ExpeditionItem
        fields = ['id', 'lot', 'lot_number', 'species_name', 'quantity']


class ExpeditionListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse_origin.name', read_only=True)
    total_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Expedition
        fields = [
            'id', 'expedition_number', 'warehouse_origin', 'warehouse_name',
            'destination', 'destination_name', 'status', 'status_display',
            'scheduled_date', 'shipped_at', 'delivered_at', 'total_quantity',
            'created_at'
        ]


class ExpeditionDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse_origin.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    items = ExpeditionItemSerializer(many=True, read_only=True)
    total_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    deliveries_count = serializers.SerializerMethodField()

    class Meta:
        model = Expedition
        fields = [
            'id', 'expedition_number', 'warehouse_origin', 'warehouse_name',
            'destination', 'destination_name', 'seed_request',
            'status', 'status_display', 'scheduled_date',
            'shipped_at', 'delivered_at', 'vehicle_plate', 'driver_name',
            'delivery_proof', 'notes', 'items', 'total_quantity',
            'deliveries_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['expedition_number', 'created_at', 'updated_at']

    def get_deliveries_count(self, obj):
        return obj.deliveries.count()


class ExpeditionCreateSerializer(serializers.ModelSerializer):
    items = ExpeditionItemSerializer(many=True)

    class Meta:
        model = Expedition
        fields = [
            'warehouse_origin', 'destination', 'seed_request',
            'scheduled_date', 'vehicle_plate', 'driver_name', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        # Gera número da expedição
        now = timezone.now()
        count = Expedition.objects.filter(
            created_at__year=now.year
        ).count() + 1
        expedition_number = f"EXP-{now.year}-{count:05d}"

        expedition = Expedition.objects.create(
            expedition_number=expedition_number,
            created_by=user,
            **validated_data
        )

        for item_data in items_data:
            ExpeditionItem.objects.create(expedition=expedition, **item_data)

        return expedition


class DeliverySerializer(serializers.ModelSerializer):
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    species_name = serializers.CharField(source='lot.species.name', read_only=True)
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)
    delivered_by_name = serializers.CharField(source='delivered_by.get_full_name', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'expedition', 'lot', 'lot_number', 'species_name',
            'farmer', 'farmer_name', 'quantity', 'delivered_at',
            'delivered_by', 'delivered_by_name', 'signature',
            'proof_photo', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class DeliveryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = [
            'expedition', 'lot', 'farmer', 'quantity',
            'delivered_at', 'signature', 'proof_photo', 'notes'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        return Delivery.objects.create(
            delivered_by=user,
            **validated_data
        )
