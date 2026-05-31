from django.db import models
from django.conf import settings


# ═══════════════════════════════════════════════════════════
# 1. DOCTOR APPLICATION
# Doctor register karta hai → yahan data jata hai
# Admin approve kare to phir User account banta hai
# ═══════════════════════════════════════════════════════════

class DoctorApplication(models.Model):
    """
    Doctor ki application — Pending review tak User account NAHI banta.
    """

    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    class Specialty(models.TextChoices):
        PEDIATRIC_HOMEOPATH    = 'pediatric_homeopath',    'Pediatric Homeopath'
        CHILD_SPECIALIST       = 'child_specialist',       'Child Specialist'
        ORGANIC_MEDICINE       = 'organic_medicine',       'Organic Medicine'
        HOMEOPATHIC_CONSULTANT = 'homeopathic_consultant', 'Homeopathic Consultant'

    # ─── Personal Info ───
    full_name = models.CharField(max_length=100)
    email     = models.EmailField(unique=True, help_text='Credentials yahin bheje jayenge')
    phone     = models.CharField(max_length=20)

    # ─── Professional Info ───
    pmdc_number       = models.CharField(max_length=50, unique=True)
    specialty         = models.CharField(max_length=30, choices=Specialty.choices)
    experience_years  = models.PositiveIntegerField()
    clinic_address    = models.TextField(blank=True)
    consultation_fee  = models.PositiveIntegerField(default=1000, help_text='Rs. mein')

    # ─── Documents (Files) ───
    pmdc_license   = models.FileField(upload_to='doctor_docs/pmdc/')
    cnic_front     = models.FileField(upload_to='doctor_docs/cnic/')
    cnic_back      = models.FileField(upload_to='doctor_docs/cnic/')
    degree         = models.FileField(upload_to='doctor_docs/degree/')
    profile_photo  = models.ImageField(upload_to='doctor_docs/photos/', blank=True, null=True)

    # ─── Status ───
    status            = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    rejection_reason  = models.TextField(blank=True)

    # ─── Generated Credentials ───
    generated_password = models.CharField(max_length=50, blank=True)

    # ─── Link to User after approval ───
    linked_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='doctor_application',
    )

    # ─── Timestamps ───
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Doctor Application'
        verbose_name_plural = 'Doctor Applications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.full_name} — {self.get_status_display()}"


# ═══════════════════════════════════════════════════════════
# 2. DOCTOR PROFILE
# Approved doctors ki public profile
# ═══════════════════════════════════════════════════════════

class DoctorProfile(models.Model):
    """Approved doctors ki public profile."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
    )

    full_name         = models.CharField(max_length=100)
    pmdc_number       = models.CharField(max_length=50, unique=True)
    specialty         = models.CharField(max_length=50)
    experience_years  = models.PositiveIntegerField()
    clinic_address    = models.TextField(blank=True)
    consultation_fee  = models.PositiveIntegerField(default=1000)
    profile_photo     = models.ImageField(upload_to='doctor_profiles/', blank=True, null=True)
    bio               = models.TextField(blank=True)

    rating            = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews     = models.PositiveIntegerField(default=0)
    total_patients    = models.PositiveIntegerField(default=0)

    is_available      = models.BooleanField(default=True)

    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Doctor Profile'
        verbose_name_plural = 'Doctor Profiles'

    def __str__(self):
        return f"Dr. {self.full_name} ({self.specialty})"