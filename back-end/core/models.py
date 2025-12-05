from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Municipality(models.Model):
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=100, default='Pernambuco')
    code = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.state}"

class Farm(models.Model):
    owner = models.ForeignKey(User, related_name='farms', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    municipality = models.ForeignKey(Municipality, related_name='farms', on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=300, blank=True)
    geom = models.CharField(max_length=200, blank=True, help_text='WKT or GeoJSON as text')

    def __str__(self):
        return self.name

class Field(models.Model):
    farm = models.ForeignKey(Farm, related_name='fields', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    area_ha = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    is_rural = models.BooleanField(default=True)
    polygon = models.TextField(blank=True, help_text='GeoJSON polygon')

    def __str__(self):
        return f"{self.name} ({self.farm.name})"

class Crop(models.Model):
    field = models.ForeignKey(Field, related_name='crops', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    planted_on = models.DateField(null=True, blank=True)
    harvest_on = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.field.name}"

class SensorData(models.Model):
    field = models.ForeignKey(Field, related_name='sensordata', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"SensorData {self.field.name} @ {self.timestamp}"
