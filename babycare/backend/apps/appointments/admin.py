from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'baby_name', 'appointment_date', 'time_slot', 'status', 'created_at')
    list_filter  = ('status', 'appointment_date', 'created_at')
    search_fields = ('patient__email', 'doctor__full_name', 'baby_name', 'symptom')
    ordering = ('-created_at',)