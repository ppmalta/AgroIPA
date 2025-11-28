"""
AgroIPA - Views Públicas (Transparência e Rastreabilidade)
"""

from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from inventory.models import Lot, Species, Municipality, Warehouse
from logistics.models import Delivery, Expedition


class PublicDashboardView(views.APIView):
    """Painel público de transparência - dados agregados"""

    permission_classes = [AllowAny]

    def get(self, request):
        # Parâmetros de filtro
        year = request.query_params.get('year')
        municipality_id = request.query_params.get('municipality')

        # Base query para entregas
        deliveries = Delivery.objects.all()
        if year:
            deliveries = deliveries.filter(delivered_at__year=year)
        if municipality_id:
            deliveries = deliveries.filter(
                expedition__destination_id=municipality_id
            )

        # Estatísticas gerais
        stats = deliveries.aggregate(
            total_quantity=Sum('quantity'),
            total_deliveries=Count('id'),
            total_farmers=Count('farmer', distinct=True)
        )

        # Municípios atendidos
        municipalities_count = Expedition.objects.filter(
            status='entregue'
        ).values('destination').distinct().count()

        # Distribuição por espécie
        by_species = deliveries.values(
            'lot__species__name'
        ).annotate(
            total=Sum('quantity')
        ).order_by('-total')[:10]

        # Distribuição por mês
        by_month = deliveries.annotate(
            month=TruncMonth('delivered_at')
        ).values('month').annotate(
            total=Sum('quantity'),
            count=Count('id')
        ).order_by('month')

        # Top municípios
        top_municipalities = deliveries.values(
            'expedition__destination__name'
        ).annotate(
            total=Sum('quantity')
        ).order_by('-total')[:10]

        return Response({
            'summary': {
                'total_distributed': stats['total_quantity'] or 0,
                'total_deliveries': stats['total_deliveries'] or 0,
                'total_farmers': stats['total_farmers'] or 0,
                'municipalities_served': municipalities_count,
            },
            'by_species': [
                {'name': item['lot__species__name'], 'quantity': item['total']}
                for item in by_species
            ],
            'by_month': [
                {
                    'month': item['month'].strftime('%Y-%m') if item['month'] else None,
                    'quantity': item['total'],
                    'deliveries': item['count']
                }
                for item in by_month
            ],
            'top_municipalities': [
                {'name': item['expedition__destination__name'], 'quantity': item['total']}
                for item in top_municipalities
            ],
        })


class LotTraceView(views.APIView):
    """Rastreabilidade pública de lote por UUID"""

    permission_classes = [AllowAny]

    def get(self, request, uuid):
        try:
            lot = Lot.objects.select_related(
                'species', 'supplier'
            ).get(uuid=uuid)
        except Lot.DoesNotExist:
            return Response(
                {'error': 'Lote não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Histórico de movimentações (sem dados sensíveis)
        movements = lot.movements.select_related(
            'warehouse_origin', 'warehouse_destination'
        ).order_by('created_at')

        timeline = []
        for mov in movements:
            timeline.append({
                'date': mov.created_at.isoformat(),
                'type': mov.get_movement_type_display(),
                'origin': mov.warehouse_origin.name if mov.warehouse_origin else None,
                'destination': mov.warehouse_destination.name if mov.warehouse_destination else None,
                'quantity': float(mov.quantity),
            })

        # Entregas (dados agregados, sem identificar agricultores)
        deliveries = lot.deliveries.values(
            'expedition__destination__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_deliveries=Count('id')
        )

        delivery_summary = [
            {
                'municipality': d['expedition__destination__name'],
                'quantity': float(d['total_quantity']),
                'deliveries_count': d['total_deliveries']
            }
            for d in deliveries
        ]

        return Response({
            'lot': {
                'number': lot.lot_number,
                'species': lot.species.name,
                'supplier': lot.supplier.name,
                'manufacture_date': lot.manufacture_date.isoformat(),
                'expiry_date': lot.expiry_date.isoformat(),
                'initial_quantity': float(lot.initial_quantity),
                'status': lot.get_status_display(),
            },
            'timeline': timeline,
            'deliveries': delivery_summary,
        })


class MunicipalityListPublicView(views.APIView):
    """Lista pública de municípios para filtros"""

    permission_classes = [AllowAny]

    def get(self, request):
        municipalities = Municipality.objects.filter(is_active=True).values('id', 'name', 'state')
        return Response(list(municipalities))


class SpeciesListPublicView(views.APIView):
    """Lista pública de espécies para filtros"""

    permission_classes = [AllowAny]

    def get(self, request):
        species = Species.objects.filter(is_active=True).values('id', 'name')
        return Response(list(species))
