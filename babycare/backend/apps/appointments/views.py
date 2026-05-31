from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Appointment
from .serializers import (
    PublicDoctorSerializer,
    BookAppointmentSerializer,
    AppointmentSerializer,
    UpdateStatusSerializer,
)
from apps.doctors.models import DoctorProfile


# ═══════════════════════════════════════════════════════════
# 1. PUBLIC — List All Approved Doctors (booking page)
# GET /api/appointments/doctors/
# ═══════════════════════════════════════════════════════════

class PublicDoctorListView(generics.ListAPIView):
    serializer_class = PublicDoctorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Sirf active + available doctors
        return DoctorProfile.objects.filter(
            user__is_active=True
        ).select_related('user')


# ═══════════════════════════════════════════════════════════
# 2. USER — Book Appointment
# POST /api/appointments/book/
# ═══════════════════════════════════════════════════════════

class BookAppointmentView(generics.CreateAPIView):
    serializer_class = BookAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # ✅ CLASH CHECK — Same doctor + same date + same time slot
        doctor_id = serializer.validated_data['doctor'].id
        appointment_date = serializer.validated_data['appointment_date']
        time_slot = serializer.validated_data['time_slot']
        
        existing = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date=appointment_date,
            time_slot=time_slot,
        ).exclude(status='cancelled').exists()
        
        if existing:
            return Response({
                'detail': f'Yeh time slot ({time_slot}) iss date pe pehle se booked hai. Koi aur time choose karein.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ DATE VALIDATION — Past dates allowed nahi
        from django.utils import timezone
        today = timezone.now().date()
        if appointment_date < today:
            return Response({
                'detail': 'Past date par appointment book nahi kar sakte. Aaj ya future date choose karein.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        appointment = serializer.save()

        return Response({
            'message': 'Appointment booked successfully!',
            'appointment': AppointmentSerializer(appointment).data,
        }, status=status.HTTP_201_CREATED)


# ═══════════════════════════════════════════════════════════
# 3. USER — My Appointments (as patient)
# GET /api/appointments/my/
# ═══════════════════════════════════════════════════════════

class MyAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)


# ═══════════════════════════════════════════════════════════
# 4. DOCTOR — My Appointments (as doctor)
# GET /api/appointments/doctor/
# ═══════════════════════════════════════════════════════════

class DoctorAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Logged-in user ka doctor profile dhundo
        try:
            doctor_profile = self.request.user.doctor_profile
        except DoctorProfile.DoesNotExist:
            return Appointment.objects.none()
        return Appointment.objects.filter(doctor=doctor_profile)


# ═══════════════════════════════════════════════════════════
# 5. UPDATE Appointment Status (Doctor: accept/reject/complete)
# PATCH /api/appointments/{id}/status/
# ═══════════════════════════════════════════════════════════

class UpdateAppointmentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'detail': 'Appointment not found'}, status=404)

        # Permission check — sirf iss appointment ka doctor ya patient
        user = request.user
        is_the_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
        is_the_patient = appointment.patient == user

        if not (is_the_doctor or is_the_patient):
            return Response({'detail': 'Permission denied'}, status=403)

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        # Patient sirf cancel kar sakta hai
        if is_the_patient and not is_the_doctor and new_status != 'cancelled':
            return Response({'detail': 'Patient sirf cancel kar sakta hai'}, status=403)

        appointment.status = new_status
        appointment.save()

        return Response({
            'message': f'Appointment {new_status}!',
            'appointment': AppointmentSerializer(appointment).data,
        })
    

# ═══════════════════════════════════════════════════════════
# AVAILABLE TIME SLOTS — User dekhe kaunse slots available hain
# GET /api/appointments/available-slots/?doctor=1&date=2026-05-30
# ═══════════════════════════════════════════════════════════

class AvailableSlotsView(APIView):
    """
    Return karta hai kaunse slots available hain ek specific doctor 
    + specific date ke liye.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    # All possible time slots
    ALL_SLOTS = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"]
    
    def get(self, request):
        doctor_id = request.query_params.get('doctor')
        date_str = request.query_params.get('date')
        
        if not doctor_id or not date_str:
            return Response({
                'detail': 'doctor aur date dono required hain'
            }, status=400)
        
        # Doctor exists?
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found'}, status=404)
        
        # Yeh date pe kaunse slots BOOKED hain dhundo
        booked_slots = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date_str,
        ).exclude(
            status='cancelled'    # Cancelled appointments count nahi karte
        ).values_list('time_slot', flat=True)
        
        booked_slots = list(booked_slots)
        
        # Available slots = All slots - Booked slots
        available_slots = [
            slot for slot in self.ALL_SLOTS 
            if slot not in booked_slots
        ]
        
        return Response({
            'doctor_id': int(doctor_id),
            'doctor_name': doctor.full_name,
            'date': date_str,
            'all_slots': self.ALL_SLOTS,
            'booked_slots': booked_slots,
            'available_slots': available_slots,
        })