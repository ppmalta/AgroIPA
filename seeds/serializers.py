from rest_framework import serializers
from .models import SeedType, Warehouse, Stock, Batch, StockMovement, SeedRequest

class SeedTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeedType
        fields = '__all__'


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = '__all__'


class SeedRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeedRequest
        fields = '__all__'
