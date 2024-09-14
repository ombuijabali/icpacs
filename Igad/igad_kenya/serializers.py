from rest_framework import serializers
from .models import Temperature, Soil, Grid01dd, SPI

class TemperatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temperature
        fields = '__all__'

class SoilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Soil
        fields = '__all__'

class Grid01ddSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grid01dd
        fields = '__all__'

class SPISerializer(serializers.ModelSerializer):
    class Meta:
        model = SPI
        fields = '__all__'
