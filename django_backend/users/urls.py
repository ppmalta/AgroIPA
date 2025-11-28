"""
AgroIPA - URLs de Usuários
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, OrganizationViewSet, RegisterView

router = DefaultRouter()
router.register('', UserViewSet, basename='user')
router.register('organizations', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]