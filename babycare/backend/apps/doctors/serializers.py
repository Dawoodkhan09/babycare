from rest_framework import serializers
from .models import DoctorApplication, DoctorProfile


# ═══════════════════════════════════════════════════════════
# Doctor Application Submit Serializer
# Doctor jab registration form fill kare
# ═══════════════════════════════════════════════════════════

class DoctorApplicationSubmitSerializer(serializers.ModelSerializer):
    """
    Doctor signup form ka serializer.
    File uploads handle karta hai.
    """

    class Meta:
        model = DoctorApplication
        fields = (
            'full_name', 'email', 'phone',
            'pmdc_number', 'specialty', 'experience_years',
            'clinic_address', 'consultation_fee',
            'pmdc_license', 'cnic_front', 'cnic_back', 'degree', 'profile_photo',
        )

    def validate_email(self, value):
        # Check if email already exists in applications
        if DoctorApplication.objects.filter(email=value).exists():
            raise serializers.ValidationError("Iss email se pehle hi application submitted hai.")
        return value

    def validate_pmdc_number(self, value):
        if DoctorApplication.objects.filter(pmdc_number=value).exists():
            raise serializers.ValidationError("Yeh PMDC number pehle se registered hai.")
        return value


# ═══════════════════════════════════════════════════════════
# Doctor Application List/Detail (Admin ke liye)
# ═══════════════════════════════════════════════════════════

class DoctorApplicationListSerializer(serializers.ModelSerializer):
    """List view ke liye — admin dashboard ke applications table mein"""

    specialty_display = serializers.CharField(source='get_specialty_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DoctorApplication
        fields = (
            'id', 'full_name', 'email', 'phone',
            'pmdc_number', 'specialty', 'specialty_display',
            'experience_years', 'consultation_fee',
            'status', 'status_display',
            'submitted_at',
        )


class DoctorApplicationDetailSerializer(serializers.ModelSerializer):
    """Detail view — sab info aur documents ke saath"""

    specialty_display = serializers.CharField(source='get_specialty_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Full URLs for documents
    pmdc_license_url  = serializers.SerializerMethodField()
    cnic_front_url    = serializers.SerializerMethodField()
    cnic_back_url     = serializers.SerializerMethodField()
    degree_url        = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = DoctorApplication
        fields = (
            'id', 'full_name', 'email', 'phone',
            'pmdc_number', 'specialty', 'specialty_display',
            'experience_years', 'clinic_address', 'consultation_fee',
            'pmdc_license_url', 'cnic_front_url', 'cnic_back_url',
            'degree_url', 'profile_photo_url',
            'status', 'status_display', 'rejection_reason',
            'generated_password',
            'submitted_at', 'reviewed_at',
        )

    def _build_url(self, file_field):
        if not file_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(file_field.url)
        return file_field.url

    def get_pmdc_license_url(self, obj):  return self._build_url(obj.pmdc_license)
    def get_cnic_front_url(self, obj):    return self._build_url(obj.cnic_front)
    def get_cnic_back_url(self, obj):     return self._build_url(obj.cnic_back)
    def get_degree_url(self, obj):        return self._build_url(obj.degree)
    def get_profile_photo_url(self, obj): return self._build_url(obj.profile_photo)


# ═══════════════════════════════════════════════════════════
# Reject Serializer
# ═══════════════════════════════════════════════════════════

class RejectApplicationSerializer(serializers.Serializer):
    """Application reject karne ke liye reason chahiye"""
    rejection_reason = serializers.CharField(required=True, min_length=10)


# ═══════════════════════════════════════════════════════════
# Doctor Profile Serializer
# Approved doctors list ke liye
# ═══════════════════════════════════════════════════════════

class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    profile_photo_url = serializers.SerializerMethodField() 

    class Meta:
        model = DoctorProfile
        fields = (
            'id', 'full_name', 'email', 'phone',
            'pmdc_number', 'specialty', 'experience_years',
            'clinic_address', 'consultation_fee',
            'rating', 'total_reviews', 'total_patients',
            'is_available', 'is_active', 'created_at',
            'profile_photo_url', 
        )

    def get_profile_photo_url(self, obj):                         # ⬅️ ADD
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None