from django.contrib import admin, messages
from django.utils.html import format_html
from django.utils import timezone
import secrets
import string

from .models import DoctorApplication, DoctorProfile
from apps.accounts.models import User


def generate_random_password(length=10):
    """Random password generate karna"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


@admin.register(DoctorApplication)
class DoctorApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'full_name', 'email', 'specialty',
        'pmdc_number', 'status_colored',
        'submitted_at', 'view_credentials',
    )
    list_filter   = ('status', 'specialty', 'submitted_at')
    search_fields = ('full_name', 'email', 'pmdc_number', 'phone')
    ordering      = ('-submitted_at',)
    readonly_fields = ('submitted_at', 'reviewed_at', 'generated_password', 'linked_user')

    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'email', 'phone')
        }),
        ('Professional Information', {
            'fields': ('pmdc_number', 'specialty', 'experience_years', 'clinic_address', 'consultation_fee')
        }),
        ('Documents', {
            'fields': ('pmdc_license', 'cnic_front', 'cnic_back', 'degree', 'profile_photo'),
        }),
        ('Status', {
            'fields': ('status', 'rejection_reason'),
        }),
        ('Credentials (after approval)', {
            'fields': ('linked_user', 'generated_password'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'reviewed_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['approve_selected', 'reject_selected']

    def status_colored(self, obj):
        colors = {'pending': '#fbbf24', 'approved': '#10b981', 'rejected': '#ef4444'}
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 10px; border-radius:4px; font-weight:bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_colored.short_description = 'Status'

    def view_credentials(self, obj):
        if obj.status == 'approved' and obj.generated_password:
            return format_html(
                '<span style="color:green; font-weight:bold;">📧 {} <br>🔑 {}</span>',
                obj.email, obj.generated_password
            )
        return '—'
    view_credentials.short_description = 'Credentials'

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = DoctorApplication.objects.get(pk=obj.pk)
            old_status = old_obj.status
        else:
            old_status = None

        if obj.status == 'approved' and old_status != 'approved':
            self._approve_doctor(request, obj)
        elif obj.status == 'rejected' and old_status != 'rejected':
            obj.reviewed_at = timezone.now()
            messages.warning(request, f'❌ Application "{obj.full_name}" rejected.')

        super().save_model(request, obj, form, change)

    def _approve_doctor(self, request, app):
        if app.linked_user:
            messages.error(request, f'⚠️ "{app.full_name}" Already approved!')
            return

        if User.objects.filter(email=app.email).exists():
            messages.error(request, f'❌ Email "{app.email}"Already exists.')
            app.status = 'pending'
            return

        password = generate_random_password(12)
        name_parts = app.full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            email=app.email, password=password,
            first_name=first_name, last_name=last_name,
            phone=app.phone, role=User.Role.DOCTOR,
            is_verified=True,
        )

        DoctorProfile.objects.create(
            user=user,
            full_name=app.full_name,
            pmdc_number=app.pmdc_number,
            specialty=app.get_specialty_display(),
            experience_years=app.experience_years,
            clinic_address=app.clinic_address,
            consultation_fee=app.consultation_fee,
            profile_photo=app.profile_photo,
        )

        app.linked_user = user
        app.generated_password = password
        app.reviewed_at = timezone.now()

        # Pretend email print
        print("\n" + "═" * 60)
        print("📧 PRETEND EMAIL — DOCTOR CREDENTIALS")
        print("═" * 60)
        print(f"To:       {app.email}")
        print(f"Subject:  Your BabyCare Doctor Account is Ready! 🎉")
        print(f"")
        print(f"Hello Dr. {app.full_name},")
        print(f"")
        print(f"Your account has been approved! Login credentials:")
        print(f"")
        print(f"  📧 Email:    {app.email}")
        print(f"  🔑 Password: {password}")
        print(f"")
        print(f"Login: http://localhost:3000/login")
        print("═" * 60 + "\n")

        messages.success(
            request,
            format_html(
                '✅ Doctor "{}" approved! <br>'
                '<strong>📧 Email:</strong> {} <br>'
                '<strong>🔑 Password:</strong> {}',
                app.full_name, app.email, password
            )
        )

    def approve_selected(self, request, queryset):
        count = 0
        for app in queryset.filter(status='pending'):
            app.status = 'approved'
            self._approve_doctor(request, app)
            app.save()
            count += 1
        messages.success(request, f'✅ {count} applications approved!')
    approve_selected.short_description = '✅ Approve selected'

    def reject_selected(self, request, queryset):
        count = queryset.filter(status='pending').update(
            status='rejected', reviewed_at=timezone.now()
        )
        messages.success(request, f'❌ {count} rejected!')
    reject_selected.short_description = '❌ Reject selected'


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialty', 'experience_years', 'consultation_fee', 'rating', 'is_available')
    list_filter   = ('specialty', 'is_available')
    search_fields = ('full_name', 'pmdc_number', 'user__email')
    readonly_fields = ('user', 'rating', 'total_reviews', 'total_patients', 'created_at', 'updated_at')