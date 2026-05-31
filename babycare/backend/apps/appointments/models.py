from django.db import models
from django.conf import settings
from apps.doctors.models import DoctorProfile


class Appointment(models.Model):
    """Patient (parent) doctor ke saath appointment book karta hai."""

    class Status(models.TextChoices):
        PENDING   = 'pending',   'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    # ─── Who ───
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient',
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
    )

    # ─── Baby / Patient details ───
    baby_name = models.CharField(max_length=100)
    baby_age  = models.CharField(max_length=50, help_text='e.g. 8 months')
    symptom   = models.CharField(max_length=200)
    notes     = models.TextField(blank=True)

    # ─── Scheduling ───
    appointment_date = models.DateField()
    time_slot        = models.CharField(max_length=30, help_text='e.g. 10:00 AM')

    # ─── Contact ───
    contact_phone = models.CharField(max_length=20)

    # ─── Status ───
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    # ─── Timestamps ───
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.email} → Dr. {self.doctor.full_name} ({self.status})"