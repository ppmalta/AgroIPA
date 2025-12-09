from rest_framework import serializers
from .models import DeliveryPoint, DeliveryRoute, RouteStop

class DeliveryPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPoint
        fields = '__all__'


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = '__all__'


class DeliveryRouteSerializer(serializers.ModelSerializer):
    stops = RouteStopSerializer(many=True, read_only=True)
    class Meta:
        model = DeliveryRoute
        fields = '__all__'
