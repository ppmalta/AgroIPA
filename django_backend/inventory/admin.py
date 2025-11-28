from django.contrib import admin
from .models import Species, Supplier, Municipality, Warehouse, Lot, Stock, StockMovement


@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ['name', 'scientific_name', 'unit', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'scientific_name']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'cnpj', 'phone', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'cnpj']


@admin.register(Municipality)
class MunicipalityAdmin(admin.ModelAdmin):
    list_display = ['name', 'code_ibge', 'state', 'is_active']
    list_filter = ['state', 'is_active']
    search_fields = ['name', 'code_ibge']


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'municipality', 'capacity', 'is_active']
    list_filter = ['municipality', 'is_active']
    search_fields = ['name', 'code']


@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ['lot_number', 'species', 'supplier', 'initial_quantity', 'status', 'expiry_date']
    list_filter = ['species', 'supplier', 'status']
    search_fields = ['lot_number']
    readonly_fields = ['uuid', 'qr_code']


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['warehouse', 'lot', 'quantity', 'updated_at']
    list_filter = ['warehouse']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['lot', 'movement_type', 'quantity', 'warehouse_origin', 'warehouse_destination', 'created_at']
    list_filter = ['movement_type']
    search_fields = ['lot__lot_number', 'reference']
