import secrets
import string
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import DoctorApplication, DoctorProfile
from .serializers import (
    DoctorApplicationSubmitSerializer,
    DoctorApplicationListSerializer,
    DoctorApplicationDetailSerializer,
    DoctorProfileSerializer,
    RejectApplicationSerializer,
)
from apps.accounts.models import User


# ═══════════════════════════════════════════════════════════
# Permission: Admin Only
# ═══════════════════════════════════════════════════════════

class IsAdminUser(permissions.BasePermission):
    """Sirf admin role wale users iss API ko access kar sakte hain"""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


# ═══════════════════════════════════════════════════════════
# Helper
# ═══════════════════════════════════════════════════════════

def generate_random_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ═══════════════════════════════════════════════════════════
# 1. DOCTOR APPLICATION SUBMIT (Public)
# POST /api/doctors/apply/
# ═══════════════════════════════════════════════════════════

class DoctorApplicationSubmitView(generics.CreateAPIView):
    """
    Doctor apni registration submit karta hai.
    Koi authentication nahi chahiye.
    """
    queryset = DoctorApplication.objects.all()
    serializer_class = DoctorApplicationSubmitSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]    # File upload ke liye

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        return Response({
            'message': 'Application submitted successfully! Admin verification ke baad credentials email pe milenge.',
            'application_id': application.id,
            'status': application.status,
            'email': application.email,
        }, status=status.HTTP_201_CREATED)


# ═══════════════════════════════════════════════════════════
# 2. ADMIN — LIST ALL APPLICATIONS
# GET /api/doctors/admin/applications/
# Filter: ?status=pending|approved|rejected
# ═══════════════════════════════════════════════════════════

class AdminApplicationListView(generics.ListAPIView):
    serializer_class = DoctorApplicationListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = DoctorApplication.objects.all()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


# ═══════════════════════════════════════════════════════════
# 3. ADMIN — APPLICATION DETAIL
# GET /api/doctors/admin/applications/{id}/
# ═══════════════════════════════════════════════════════════

class AdminApplicationDetailView(generics.RetrieveAPIView):
    queryset = DoctorApplication.objects.all()
    serializer_class = DoctorApplicationDetailSerializer
    permission_classes = [IsAdminUser]


# ═══════════════════════════════════════════════════════════
# 4. ADMIN — APPROVE APPLICATION
# POST /api/doctors/admin/applications/{id}/approve/
# ═══════════════════════════════════════════════════════════

class AdminApproveApplicationView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            app = DoctorApplication.objects.get(pk=pk)
        except DoctorApplication.DoesNotExist:
            return Response({'detail': 'Application not found'}, status=404)

        # Already approved?
        if app.status == 'approved' or app.linked_user:
            return Response({'detail': 'Yeh application pehle se approved hai.'}, status=400)

        # Email already exists in User table?
        if User.objects.filter(email=app.email).exists():
            return Response({'detail': f'Email "{app.email}" pehle se registered hai.'}, status=400)

        # Generate password
        password = generate_random_password(12)

        # Create user
        name_parts = app.full_name.strip().split(' ', 1)
        user = User.objects.create_user(
            email=app.email, password=password,
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else '',
            phone=app.phone,
            role=User.Role.DOCTOR,
            is_verified=True,
        )

        # Create doctor profile
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

        # Update application
        app.status = 'approved'
        app.linked_user = user
        app.generated_password = password
        app.reviewed_at = timezone.now()
        app.save()

        # Pretend email — CMD pe print
        print("\n" + "═" * 60)
        print("📧 PRETEND EMAIL — DOCTOR APPROVED")
        print("═" * 60)
        print(f"To:       {app.email}")
        print(f"Subject:  Your BabyCare Doctor Account is Ready! 🎉")
        print(f"\nHello Dr. {app.full_name},\n")
        print(f"Your application has been approved!\n")
        print(f"  📧 Email:    {app.email}")
        print(f"  🔑 Password: {password}")
        print(f"\nLogin: http://localhost:3000/login")
        print("═" * 60 + "\n")

        return Response({
            'message': f'Doctor {app.full_name} approved!',
            'credentials': {
                'email': app.email,
                'password': password,
            }
        }, status=200)


# ═══════════════════════════════════════════════════════════
# 5. ADMIN — REJECT APPLICATION
# POST /api/doctors/admin/applications/{id}/reject/
# Body: { "rejection_reason": "..." }
# ═══════════════════════════════════════════════════════════

class AdminRejectApplicationView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            app = DoctorApplication.objects.get(pk=pk)
        except DoctorApplication.DoesNotExist:
            return Response({'detail': 'Application not found'}, status=404)

        if app.status != 'pending':
            return Response({'detail': 'Sirf pending applications reject ho sakti hain.'}, status=400)

        serializer = RejectApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app.status = 'rejected'
        app.rejection_reason = serializer.validated_data['rejection_reason']
        app.reviewed_at = timezone.now()
        app.save()

        # Pretend email
        print("\n" + "═" * 60)
        print(f"📧 PRETEND EMAIL — APPLICATION REJECTED")
        print(f"To: {app.email}")
        print(f"Reason: {app.rejection_reason}")
        print("═" * 60 + "\n")

        return Response({
            'message': f'Application rejected.',
            'rejection_reason': app.rejection_reason,
        }, status=200)


# ═══════════════════════════════════════════════════════════
# 6. ADMIN — LIST ALL DOCTORS (Approved)
# GET /api/doctors/admin/doctors/
# ═══════════════════════════════════════════════════════════

class AdminDoctorListView(generics.ListAPIView):
    queryset = DoctorProfile.objects.all().select_related('user')
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAdminUser]


# ═══════════════════════════════════════════════════════════
# 7. ADMIN — STATS (Dashboard ke liye)
# GET /api/doctors/admin/stats/
# ═══════════════════════════════════════════════════════════

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_parents = User.objects.filter(role='parent').count()
        total_doctors = User.objects.filter(role='doctor').count()
        pending_apps  = DoctorApplication.objects.filter(status='pending').count()
        approved_apps = DoctorApplication.objects.filter(status='approved').count()
        rejected_apps = DoctorApplication.objects.filter(status='rejected').count()

        return Response({
            'total_parents': total_parents,
            'total_doctors': total_doctors,
            'pending_applications': pending_apps,
            'approved_applications': approved_apps,
            'rejected_applications': rejected_apps,
            'total_users': total_parents + total_doctors,
        })


# ═══════════════════════════════════════════════════════════
# 8. CHECK APPLICATION STATUS (Public — for doctor to check)
# GET /api/doctors/check-status/?email=...
# ═══════════════════════════════════════════════════════════

class CheckApplicationStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'detail': 'Email zaroori hai'}, status=400)

        try:
            app = DoctorApplication.objects.get(email=email)
        except DoctorApplication.DoesNotExist:
            return Response({'detail': 'Iss email se koi application nahi mili'}, status=404)

        return Response({
            'full_name': app.full_name,
            'email': app.email,
            'status': app.status,
            'status_display': app.get_status_display(),
            'submitted_at': app.submitted_at,
            'reviewed_at': app.reviewed_at,
            'rejection_reason': app.rejection_reason if app.status == 'rejected' else None,
        })
    

# ═══════════════════════════════════════════════════════════
# ADMIN — Suspend/Activate Doctor
# POST /api/doctors/admin/doctors/{id}/toggle-active/
# ═══════════════════════════════════════════════════════════

class AdminToggleDoctorActiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            profile = DoctorProfile.objects.get(pk=pk)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found'}, status=404)

        # Toggle user active status
        user = profile.user
        user.is_active = not user.is_active
        user.save()

        action = "activated" if user.is_active else "suspended"
        return Response({
            'message': f'Doctor {action}!',
            'is_active': user.is_active,
        })


# ═══════════════════════════════════════════════════════════
# ADMIN — Delete Doctor (permanent)
# DELETE /api/doctors/admin/doctors/{id}/delete/
# ═══════════════════════════════════════════════════════════

class AdminDeleteDoctorView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            profile = DoctorProfile.objects.get(pk=pk)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found'}, status=404)

        doctor_name = profile.full_name
        user = profile.user

        # User delete karne se profile aur appointments bhi cascade delete honge
        user.delete()

        return Response({
            'message': f'Doctor {doctor_name} permanently deleted.',
        }, status=200)
    

# ═══════════════════════════════════════════════════════════
# DOCTOR — Get My Own Profile
# GET /api/doctors/my-profile/
# ═══════════════════════════════════════════════════════════

class MyDoctorProfileView(generics.RetrieveAPIView):
    """Logged-in doctor apni profile dekhe"""
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        profile = self.get_object()
        if not profile:
            return Response({'detail': 'Aap doctor nahi hain.'}, status=404)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)