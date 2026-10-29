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

import google.generativeai as genai
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import os


# ═══════════════════════════════════════════════════════════
# Permission: Admin Only
# ═══════════════════════════════════════════════════════════

class IsAdminUser(permissions.BasePermission):
    """Only users with the admin role can access this API."""

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
    Doctor submits their registration. No authentication required.
    """
    queryset = DoctorApplication.objects.all()
    serializer_class = DoctorApplicationSubmitSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]    # For file uploads

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        return Response({
            'message': 'Application submitted successfully! You will receive your login credentials via email after admin verification.',
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
            return Response({'detail': 'This application has already been approved.'}, status=400)

        # Email already exists in User table?
        if User.objects.filter(email=app.email).exists():
            return Response({'detail': f'Email "{app.email}" is already registered.'}, status=400)

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

        # Create doctor profile — ✅ BUG FIX: now transfers location fields
        DoctorProfile.objects.create(
            user=user,
            full_name=app.full_name,
            pmdc_number=app.pmdc_number,
            specialty=app.get_specialty_display(),
            experience_years=app.experience_years,
            clinic_address=app.clinic_address,
            consultation_fee=app.consultation_fee,
            profile_photo=app.profile_photo,
            latitude=app.latitude,          # ✅ ADDED — for map integration
            longitude=app.longitude,        # ✅ ADDED — for map integration
            city=app.city,                  # ✅ ADDED — for map integration
        )

        # Update application
        app.status = 'approved'
        app.linked_user = user
        app.generated_password = password
        app.reviewed_at = timezone.now()
        app.save()

        # Simulated email — printed to console
        print("\n" + "═" * 60)
        print("📧 SIMULATED EMAIL — DOCTOR APPROVED")
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
            return Response({'detail': 'Only pending applications can be rejected.'}, status=400)

        serializer = RejectApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app.status = 'rejected'
        app.rejection_reason = serializer.validated_data['rejection_reason']
        app.reviewed_at = timezone.now()
        app.save()

        # Simulated email
        print("\n" + "═" * 60)
        print(f"📧 SIMULATED EMAIL — APPLICATION REJECTED")
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
# 7. ADMIN — STATS (for dashboard)
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
# 8. CHECK APPLICATION STATUS (Public — doctor can check their status)
# GET /api/doctors/check-status/?email=...
# ═══════════════════════════════════════════════════════════

class CheckApplicationStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=400)

        try:
            app = DoctorApplication.objects.get(email=email)
        except DoctorApplication.DoesNotExist:
            return Response({'detail': 'No application found for this email.'}, status=404)

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
# ADMIN — Suspend / Activate Doctor
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

        # Deleting the user will cascade delete the profile and related appointments
        user.delete()

        return Response({
            'message': f'Doctor {doctor_name} permanently deleted.',
        }, status=200)


# ═══════════════════════════════════════════════════════════
# DOCTOR — Get My Own Profile
# GET /api/doctors/my-profile/
# ═══════════════════════════════════════════════════════════

class MyDoctorProfileView(generics.RetrieveAPIView):
    """Logged-in doctor can view their own profile."""
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
            return Response({'detail': 'You are not a doctor.'}, status=404)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

SYSTEM_PROMPT = """You are BabyCare AI — a specialist homeopathic and organic medicine advisor for babies and toddlers in Pakistan.

YOUR ROLE:
You provide specific homeopathic and organic treatment recommendations for baby symptoms. You are knowledgeable about classical homeopathy, herbal remedies, and organic treatments commonly used in Pakistan.

STRICT OUTPUT FORMAT — Always respond in this exact structure:

1. DIAGNOSIS (possible): [1-2 line about likely condition]

2. HOMEOPATHIC REMEDIES:
   • [Remedy Name] [Potency] — [How to give, dosage, frequency]
   • [Remedy Name] [Potency] — [How to give, dosage, frequency]
   • [Remedy Name] [Potency] — [How to give, dosage, frequency]

3. ORGANIC/HERBAL REMEDIES:
   • [Remedy] — [How to prepare and give]
   • [Remedy] — [How to prepare and give]

4. HOME CARE TIPS:
   • [Tip 1]
   • [Tip 2]

5. CONSULT DOCTOR IF:
   • [Warning sign 1]
   • [Warning sign 2]

HOMEOPATHIC REMEDIES TO USE (by symptom):
- Fever: Belladonna 30C, Aconite 30C, Ferrum Phos 6X
- Cough/Cold: Pulsatilla 30C, Hepar Sulph 30C, Bryonia 30C
- Diarrhea: Podophyllum 30C, Chamomilla 30C, Veratrum Album 30C
- Vomiting: Ipecacuanha 30C, Nux Vomica 30C, Arsenicum Album 30C
- Teething: Chamomilla 30C, Calcarea Carb 30C, Belladonna 30C
- Colic/Crying: Colocynthis 30C, Chamomilla 30C, Magnesia Phos 6X
- Ear Pain: Pulsatilla 30C, Belladonna 30C, Hepar Sulph 30C
- Skin Rash: Sulphur 30C, Graphites 30C, Rhus Tox 30C
- Sleep Issues: Chamomilla 30C, Coffea Cruda 30C, Pulsatilla 30C
- Feeding Problems: Lycopodium 30C, Nux Vomica 30C, Calcarea Carb 30C
- Constipation: Nux Vomica 30C, Bryonia 30C, Silicea 30C
- Eye Discharge: Euphrasia 30C, Pulsatilla 30C, Argentum Nit 30C

ORGANIC/HERBAL REMEDIES (Pakistan-available):
- Fever: Tulsi (basil) leaf water, Ginger + honey water, Wet cloth on forehead
- Cough/Cold: Honey + black seed (kalonji) oil, Ginger tea (diluted), Steam inhalation
- Diarrhea: Pomegranate peel tea, Yogurt + banana, ORS + probiotics
- Vomiting: Ginger drops in water, Fennel (saunf) water, Small sips of honey water
- Colic: Gripe water, Fennel seed water (saunf), Warm compress on belly
- Teething: Clove oil (diluted) on gums, Cold chamomile tea on gums, Carrot stick to chew
- Ear Pain: Warm garlic oil drops, Warm compress outside ear
- Skin Rash: Coconut oil, Neem paste (diluted), Aloe vera gel
- Constipation: Prune juice (diluted), Olive oil massage on belly, Warm water + fennel

LANGUAGE RULE:
- Detect input language (Urdu/Roman Urdu/English)
- Respond in EXACTLY the same language
- Use simple words parents can understand

EMERGENCY RULE:
If symptoms include: high fever in newborn (under 3 months), difficulty breathing, blue lips, unconscious, severe dehydration — say IMMEDIATELY: "EMERGENCY — Go to nearest hospital NOW. Yeh case ghar pe treat nahi hota."

DISCLAIMER (always add at end):
"⚠️ Note: Homeopathic/organic remedies are complementary. For severe symptoms, always consult a qualified pediatric homeopath or doctor."
"""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def symptom_check_ai(request):
    # Get data
    selected_symptoms = request.data.get('symptoms', [])
    user_message      = request.data.get('message', '')
    baby_age          = request.data.get('age', '')
    duration          = request.data.get('duration', '')

    # Build prompt
    parts = []
    if selected_symptoms:
        parts.append(f"Symptoms: {', '.join(selected_symptoms)}")
    if baby_age:
        parts.append(f"Baby age: {baby_age}")
    if duration:
        parts.append(f"Duration: {duration}")
    if user_message:
        parts.append(f"Additional info: {user_message}")

    if not parts:
        return Response({'error': 'Please provide symptoms'}, status=400)

    full_message = ". ".join(parts)

    try:
        # ── KEY FIX: Read from env directly ──
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')

        if not api_key:
            return Response({
                'error': 'GEMINI_API_KEY not configured on server.'
            }, status=503)

        # Configure INSIDE the function (not at module level)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        response = model.generate_content(
            SYSTEM_PROMPT + "\n\nParent's message: " + full_message
        )

        return Response({
            'response':   response.text,
            'symptoms':   selected_symptoms,
            'ai_powered': True,
        })

    except Exception as e:
        return Response({
            'error': str(e),
            'ai_powered': False,
        }, status=503)