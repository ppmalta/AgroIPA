"""
AgroIPA - Serializers de Inventário
"""

from rest_framework import serializers
from .models import Species, Supplier, Municipality, Warehouse, Lot, Stock, StockMovement


class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ['id', 'name', 'scientific_name', 'description', 'unit', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'cnpj', 'address', 'phone', 'email',
            'contact_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = ['id', 'name', 'code_ibge', 'state', 'is_active']


class WarehouseSerializer(serializers.ModelSerializer):
    municipality_name = serializers.CharField(source='municipality.name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    current_stock = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Warehouse
        fields = [
            'id', 'name', 'code', 'address', 'municipality', 'municipality_name',
            'capacity', 'current_stock', 'manager', 'manager_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LotListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem"""
    species_name = serializers.CharField(source='species.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Lot
        fields = [
            'id', 'lot_number', 'uuid', 'species', 'species_name',
            'supplier', 'supplier_name', 'initial_quantity', 'current_quantity',
            'manufacture_date', 'expiry_date', 'status', 'status_display',
            'created_at'
        ]


class LotDetailSerializer(serializers.ModelSerializer):
    """Serializer completo com histórico"""
    species_name = serializers.CharField(source='species.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    current_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    stock_by_warehouse = serializers.SerializerMethodField()
    movements = serializers.SerializerMethodField()

    class Meta:
        model = Lot
        fields = [
            'id', 'lot_number', 'uuid', 'species', 'species_name',
            'supplier', 'supplier_name', 'initial_quantity', 'current_quantity',
            'manufacture_date', 'expiry_date', 'status', 'status_display',
            'qr_code', 'notes', 'created_by', 'created_by_name',
            'stock_by_warehouse', 'movements', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'qr_code', 'created_at', 'updated_at']

    def get_stock_by_warehouse(self, obj):
        stocks = obj.stock_items.select_related('warehouse').all()
        return [
            {
                'warehouse_id': s.warehouse.id,
                'warehouse_name': s.warehouse.name,
                'quantity': s.quantity
            }
            for s in stocks
        ]

    def get_movements(self, obj):
        movements = obj.movements.select_related(
            'warehouse_origin', 'warehouse_destination', 'created_by'
        ).order_by('-created_at')[:10]
        return StockMovementSerializer(movements, many=True).data


class LotCreateSerializer(serializers.ModelSerializer):
    warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(),
        write_only=True
    )

    class Meta:
        model = Lot
        fields = [
            'lot_number', 'species', 'supplier', 'initial_quantity',
            'manufacture_date', 'expiry_date', 'notes', 'warehouse'
        ]

    def create(self, validated_data):
        warehouse = validated_data.pop('warehouse')
        user = self.context['request'].user

        lot = Lot.objects.create(created_by=user, **validated_data)

        # Cria estoque inicial no armazém
        Stock.objects.create(
            warehouse=warehouse,
            lot=lot,
            quantity=lot.initial_quantity
        )

        # Registra movimentação de entrada
        StockMovement.objects.create(
            lot=lot,
            movement_type=StockMovement.MovementType.ENTRADA,
            warehouse_destination=warehouse,
            quantity=lot.initial_quantity,
            reference=f"Entrada inicial - {lot.lot_number}",
            created_by=user
        )

        return lot


class StockSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    species_name = serializers.CharField(source='lot.species.name', read_only=True)
    expiry_date = serializers.DateField(source='lot.expiry_date', read_only=True)

    class Meta:
        model = Stock
        fields = [
            'id', 'warehouse', 'warehouse_name', 'lot', 'lot_number',
            'species_name', 'quantity', 'expiry_date', 'updated_at'
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    lot_number = serializers.CharField(source='lot.lot_number', read_only=True)
    warehouse_origin_name = serializers.CharField(source='warehouse_origin.name', read_only=True)
    warehouse_destination_name = serializers.CharField(source='warehouse_destination.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'lot', 'lot_number', 'movement_type', 'movement_type_display',
            'warehouse_origin', 'warehouse_origin_name',
            'warehouse_destination', 'warehouse_destination_name',
            'quantity', 'reference', 'notes',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']


class StockTransferSerializer(serializers.Serializer):
    """Serializer para transferência entre armazéns"""
    lot = serializers.PrimaryKeyRelatedField(queryset=Lot.objects.all())
    warehouse_origin = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())
    warehouse_destination = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())
    quantity = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        lot = attrs['lot']
        origin = attrs['warehouse_origin']
        quantity = attrs['quantity']

        # Verifica se há estoque suficiente
        try:
            stock = Stock.objects.get(warehouse=origin, lot=lot)
            if stock.quantity < quantity:
                raise serializers.ValidationError({
                    'quantity': f'Estoque insuficiente. Disponível: {stock.quantity}kg'
                })
        except Stock.DoesNotExist:
            raise serializers.ValidationError({
                'lot': 'Este lote não existe no armazém de origem.'
            })

        if attrs['warehouse_origin'] == attrs['warehouse_destination']:
            raise serializers.ValidationError({
                'warehouse_destination': 'Armazém de destino deve ser diferente da origem.'
            })

        return attrs
