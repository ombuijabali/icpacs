from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TemperatureViewSet, SoilViewSet, Grid01ddViewSet, SPIViewSet

router = DefaultRouter()
router.register(r'temperature', TemperatureViewSet, basename='temperature')
router.register(r'soil', SoilViewSet, basename='soil')
router.register(r'grid01dd', Grid01ddViewSet, basename='grid01dd')
router.register(r'spi', SPIViewSet, basename='spi')

urlpatterns = [
    path('', include(router.urls)),
]
