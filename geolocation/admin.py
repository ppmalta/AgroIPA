from django.contrib import admin
from .models import DeliveryPoint, DeliveryRoute, RouteStop

admin.site.register(DeliveryPoint)
admin.site.register(DeliveryRoute)
admin.site.register(RouteStop)
