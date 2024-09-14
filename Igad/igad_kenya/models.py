from django.db import models
from django.contrib.gis.db import models as gis_models

class Grid01dd(models.Model):
    id = models.BigIntegerField(primary_key=True)  # Use BigIntegerField
    xcol = models.BigIntegerField(null=True)
    yrow = models.BigIntegerField(null=True)
    csq = models.CharField(max_length=255, null=True)
    cell = models.CharField(max_length=255, null=True)
    corr_cell = gis_models.GeometryField(srid=4326, null=True)
    geom_rel = models.CharField(max_length=255, null=True)
    g1d_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    drained_m2 = models.BigIntegerField(null=True)  # Use BigIntegerField
    cent_x_geo = models.FloatField(null=True)
    cent_y_geo = models.FloatField(null=True)
    id_netcdf = models.BigIntegerField(null=True)  # Use BigIntegerField
    cty_id = models.CharField(max_length=255, null=True)
    within_igad = models.BooleanField(null=True)
    admin1_f_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    populations_2020 = models.FloatField(null=True)
    g005d_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    population_2020 = models.FloatField(null=True)
    country_iso = models.CharField(max_length=3, null=True)
    level1_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    g083d_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    gadm3_id = models.BigIntegerField(null=True)  # Use BigIntegerField
    area_km2 = models.FloatField(null=True)
    size_km = models.FloatField(null=True)
    in_lake = models.BooleanField(null=True)

    def __str__(self):
        return f"Grid01dd {self.id}"

class Temperature(models.Model):
    id = models.BigIntegerField(primary_key=True)  # Use BigIntegerField
    init_month = models.CharField(max_length=255, null=True)
    init_year = models.BigIntegerField(null=True)  # Use BigIntegerField
    pred_month = models.CharField(max_length=255, null=True)
    prob_below = models.FloatField(null=True)
    prob_above = models.CharField(max_length=255, null=True)
    prob_normal = models.FloatField(null=True)
    updated_when = models.DateTimeField(null=True)
    g0d_id = models.ForeignKey(Grid01dd, on_delete=models.CASCADE, related_name='temperatures', null=True, db_column='g0d_id')

    def __str__(self):
        return f"Temperature {self.init_year}-{self.init_month}"

class Soil(models.Model):
    id = models.BigIntegerField(primary_key=True)  # Use BigIntegerField
    year = models.BigIntegerField(null=True)  # Use BigIntegerField
    anomaly_jan = models.FloatField(null=True)
    anomaly_feb = models.FloatField(null=True)
    anomaly_mar = models.FloatField(null=True)
    anomaly_apr = models.FloatField(null=True)
    anomaly_may = models.FloatField(null=True)
    anomaly_jun = models.FloatField(null=True)
    anomaly_jul = models.FloatField(null=True)
    anomaly_aug = models.FloatField(null=True)
    anomaly_sep = models.FloatField(null=True)
    anomaly_oct = models.FloatField(null=True)
    anomaly_nov = models.FloatField(null=True)
    anomaly_dec = models.FloatField(null=True)
    updated_when = models.DateTimeField(null=True)
    g0d_id = models.ForeignKey(Grid01dd, on_delete=models.CASCADE, related_name='soils', null=True, db_column='g0d_id')

    def __str__(self):
        return f"Soil {self.year}"

class SPI(models.Model):
    id = models.BigIntegerField(primary_key=True)
    init_month = models.CharField(max_length=255, null=True)
    init_year = models.BigIntegerField(null=True)
    lead_time = models.IntegerField(null=True)
    prec = models.FloatField(null=True)
    spi_01 = models.FloatField(null=True)
    spi_03 = models.FloatField(null=True)
    spi_06 = models.FloatField(null=True)
    spi_09 = models.FloatField(null=True)
    spi_12 = models.FloatField(null=True)
    spi_15 = models.FloatField(null=True)
    spi_24 = models.FloatField(null=True)
    spi_30 = models.FloatField(null=True)
    updated_when = models.DateTimeField(null=True)
    g0d_id = models.ForeignKey(Grid01dd, on_delete=models.CASCADE, related_name='spis', null=True, db_column='g0d_id')

    def __str__(self):
        return f"SPI {self.prec}"