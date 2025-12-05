from rest_framework import viewsets, permissions
from .models import Municipality, Farm, Field, Crop, SensorData
from .serializers import MunicipalitySerializer, FarmSerializer, FieldSerializer, CropSerializer, SensorDataSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class MunicipalityViewSet(viewsets.ModelViewSet):
    queryset = Municipality.objects.all()
    serializer_class = MunicipalitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # If authenticated, set owner automatically
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            serializer.save()

class FieldViewSet(viewsets.ModelViewSet):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SensorDataViewSet(viewsets.ModelViewSet):
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
