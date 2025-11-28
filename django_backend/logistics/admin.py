from django.contrib import admin
from .models import Farmer, SeedRequest, SeedRequestItem, Expedition, ExpeditionItem, Delivery


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['name', 'cpf', 'municipality', 'organization', 'is_active']
    list_filter = ['municipality', 'is_active']
    search_fields = ['name', 'cpf']


class SeedRequestItemInline(admin.TabularInline):
    model = SeedRequestItem
    extra = 1


@admin.register(SeedRequest)
class SeedRequestAdmin(admin.ModelAdmin):
    list_display = ['request_number', 'requester', 'organization', 'status', 'beneficiaries_count', 'created_at']
    list_filter = ['status']
    search_fields = ['request_number']
    inlines = [SeedRequestItemInline]


class ExpeditionItemInline(admin.TabularInline):
    model = ExpeditionItem
    extra = 1


@admin.register(Expedition)
class ExpeditionAdmin(admin.ModelAdmin):
    list_display = ['expedition_number', 'warehouse_origin', 'destination', 'status', 'scheduled_date']
    list_filter = ['status', 'destination']
    search_fields = ['expedition_number']
    inlines = [ExpeditionItemInline]


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['lot', 'farmer', 'quantity', 'delivered_at', 'delivered_by']
    list_filter = ['expedition__destination']
    search_fields = ['farmer__name', 'lot__lot_number']
