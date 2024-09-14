from django.contrib import admin
from .models import Soil, Temperature, SPI, Grid01dd

@admin.register(Soil)
class SoilAdmin(admin.ModelAdmin):
    list_display = ('id', 'year', 'g0d_id')

@admin.register(Temperature)
class TemperatureAdmin(admin.ModelAdmin):
    list_display = ('id', 'init_year', 'init_month', 'g0d_id')

@admin.register(SPI)
class SPIAdmin(admin.ModelAdmin):
    list_display = ('id', 'init_year', 'init_month', 'g0d_id')

@admin.register(Grid01dd)
class Grid01ddAdmin(admin.ModelAdmin):
    list_display = ('id', 'xcol', 'yrow')
