from django.contrib import admin
from .models import Municipality, Farm, Field, Crop, SensorData

admin.site.register(Municipality)
admin.site.register(Farm)
admin.site.register(Field)
admin.site.register(Crop)
admin.site.register(SensorData)
