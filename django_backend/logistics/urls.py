"""
AgroIPA - URLs de Logística
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerViewSet, SeedRequestViewSet, ExpeditionViewSet, DeliveryViewSet

router = DefaultRouter()
router.register('farmers', FarmerViewSet, basename='farmer')
router.register('requests', SeedRequestViewSet, basename='seed-request')
router.register('expeditions', ExpeditionViewSet, basename='expedition')
router.register('deliveries', DeliveryViewSet, basename='delivery')

urlpatterns = [
    path('', include(router.urls)),
]