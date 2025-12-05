from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core import api

router = routers.DefaultRouter()
router.register(r'municipalities', api.MunicipalityViewSet)
router.register(r'farms', api.FarmViewSet)
router.register(r'fields', api.FieldViewSet)
router.register(r'crops', api.CropViewSet)
router.register(r'sensordata', api.SensorDataViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('core.auth_urls')),
]
