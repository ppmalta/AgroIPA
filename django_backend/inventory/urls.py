"""
AgroIPA - URLs de Inventário
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpeciesViewSet, SupplierViewSet, MunicipalityViewSet,
    WarehouseViewSet, LotViewSet, StockMovementViewSet
)

router = DefaultRouter()
router.register('species', SpeciesViewSet, basename='species')
router.register('suppliers', SupplierViewSet, basename='supplier')
router.register('municipalities', MunicipalityViewSet, basename='municipality')
router.register('warehouses', WarehouseViewSet, basename='warehouse')
router.register('lots', LotViewSet, basename='lot')
router.register('movements', StockMovementViewSet, basename='movement')

urlpatterns = [
    path('', include(router.urls)),
]
