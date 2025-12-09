from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DeliveryPoint, DeliveryRoute
from .serializers import DeliveryPointSerializer, DeliveryRouteSerializer
from .services import GoogleMapsService

class DeliveryPointViewSet(viewsets.ModelViewSet):
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer

class DeliveryRouteViewSet(viewsets.ModelViewSet):
    queryset = DeliveryRoute.objects.all()
    serializer_class = DeliveryRouteSerializer

class GeocodeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        address = request.data.get('address')
        service = GoogleMapsService()
        result = service.geocode(address)
        if result:
            return Response(result)
        return Response({'error': 'not found'}, status=404)
