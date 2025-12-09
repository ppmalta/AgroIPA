from django.contrib import admin
from .models import SeedType, Warehouse, Stock, Batch, StockMovement, SeedRequest

admin.site.register(SeedType)
admin.site.register(Warehouse)
admin.site.register(Stock)
admin.site.register(Batch)
admin.site.register(StockMovement)
admin.site.register(SeedRequest)
