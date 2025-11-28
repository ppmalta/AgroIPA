"""
AgroIPA - URLs Públicas
"""

from django.urls import path
from .views import (
    PublicDashboardView, LotTraceView,
    MunicipalityListPublicView, SpeciesListPublicView
)

urlpatterns = [
    path('dashboard/', PublicDashboardView.as_view(), name='public-dashboard'),
    path('trace/<uuid:uuid>/', LotTraceView.as_view(), name='lot-trace'),
    path('municipalities/', MunicipalityListPublicView.as_view(), name='public-municipalities'),
    path('species/', SpeciesListPublicView.as_view(), name='public-species'),
]
