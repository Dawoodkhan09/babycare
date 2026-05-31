from rest_framework import serializers
from .models import Appointment
from apps.doctors.models import DoctorProfile


# ═══════════════════════════════════════════════════════════
# Public Doctor List (Approved doctors — for booking page)
# ═══════════════════════════════════════════════════════════

class PublicDoctorSerializer(serializers.ModelSerializer):
    """Approved doctors jo users ko dikhenge booking page pe"""

    profile_photo_url = serializers.SerializerMethodField() 

    class Meta:
        model = DoctorProfile
        fields = (
            'id', 'full_name', 'specialty', 'experience_years',
            'clinic_address', 'consultation_fee',
            'rating', 'total_reviews', 'total_patients',
            'is_available',
            'profile_photo_url',
        )

    def get_profile_photo_url(self, obj):                         # ⬅️ ADD METHOD
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


# ═══════════════════════════════════════════════════════════
# Book Appointment (User submits)
# ═══════════════════════════════════════════════════════════

class BookAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = (
            'doctor', 'baby_name', 'baby_age', 'symptom', 'notes',
            'appointment_date', 'time_slot', 'contact_phone',
        )

    def create(self, validated_data):
        # Patient = currently logged-in user
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════
# Appointment Display (for lists)
# ═══════════════════════════════════════════════════════════

class AppointmentSerializer(serializers.ModelSerializer):
    # Doctor info
    doctor_name      = serializers.CharField(source='doctor.full_name', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty', read_only=True)
    doctor_fee       = serializers.IntegerField(source='doctor.consultation_fee', read_only=True)
    doctor_photo_url = serializers.SerializerMethodField()

    # Patient info
    patient_name  = serializers.SerializerMethodField()
    patient_email = serializers.CharField(source='patient.email', read_only=True)

    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id',
            'doctor', 'doctor_name', 'doctor_specialty', 'doctor_fee',
            'doctor_photo_url', 
            'patient', 'patient_name', 'patient_email',
            'baby_name', 'baby_age', 'symptom', 'notes',
            'appointment_date', 'time_slot', 'contact_phone',
            'status', 'status_display',
            'created_at',
        )

    def get_patient_name(self, obj):
        name = f"{obj.patient.first_name} {obj.patient.last_name}".strip()
        return name or obj.patient.email.split('@')[0]
    
    def get_doctor_photo_url(self, obj):                          # ⬅️ ADD METHOD
        if obj.doctor.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.doctor.profile_photo.url)
            return obj.doctor.profile_photo.url
        return None


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['confirmed', 'completed', 'cancelled'])