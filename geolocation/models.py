from django.db import models
from django.conf import settings

class DeliveryPoint(models.Model):
    name = models.CharField(max_length=200)
    point_type = models.CharField(max_length=30)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    contact_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_points'

class DeliveryRoute(models.Model):
    name = models.CharField(max_length=200)
    origin_warehouse = models.ForeignKey('seeds.Warehouse', on_delete=models.CASCADE)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, default='planned')
    planned_date = models.DateField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    polyline = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'delivery_routes'

class RouteStop(models.Model):
    route = models.ForeignKey(DeliveryRoute, on_delete=models.CASCADE, related_name='stops')
    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE)
    order = models.IntegerField()
    arrived_at = models.DateTimeField(null=True, blank=True)
    departed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'route_stops'
        ordering = ['order']
