from rest_framework import viewsets
from .models import Temperature, Soil, Grid01dd, SPI
from .serializers import TemperatureSerializer, SoilSerializer, Grid01ddSerializer, SPISerializer

class TemperatureViewSet(viewsets.ModelViewSet):
    queryset = Temperature.objects.all()
    serializer_class = TemperatureSerializer

class SoilViewSet(viewsets.ModelViewSet):
    queryset = Soil.objects.all()
    serializer_class = SoilSerializer

class Grid01ddViewSet(viewsets.ModelViewSet):
    queryset = Grid01dd.objects.all()
    serializer_class = Grid01ddSerializer

class SPIViewSet(viewsets.ModelViewSet):
    queryset = SPI.objects.all()
    serializer_class = SPISerializer
