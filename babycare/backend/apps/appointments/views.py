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
# Returns all active doctors with their map coordinates.
# Distance sorting is no longer handled here — the frontend
# now uses an interactive map (Leaflet) to display doctors.
# ═══════════════════════════════════════════════════════════

class PublicDoctorListView(generics.ListAPIView):
    """List all active and verified doctors for the public booking page."""
    serializer_class = PublicDoctorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Only active doctors
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
                'detail': f'This time slot ({time_slot}) is already booked for this date. Please choose another time.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ✅ DATE VALIDATION — Past dates not allowed
        from django.utils import timezone
        today = timezone.now().date()
        if appointment_date < today:
            return Response({
                'detail': 'You cannot book an appointment for a past date. Please choose today or a future date.'
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
        # Find the doctor profile of the logged-in user
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

        # Permission check — only the doctor or patient of this appointment
        user = request.user
        is_the_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
        is_the_patient = appointment.patient == user

        if not (is_the_doctor or is_the_patient):
            return Response({'detail': 'Permission denied'}, status=403)

        serializer = UpdateStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']

        # Patients can only cancel appointments
        if is_the_patient and not is_the_doctor and new_status != 'cancelled':
            return Response({'detail': 'Patients can only cancel appointments.'}, status=403)

        appointment.status = new_status
        appointment.save()

        return Response({
            'message': f'Appointment {new_status}!',
            'appointment': AppointmentSerializer(appointment).data,
        })


# ═══════════════════════════════════════════════════════════
# 6. AVAILABLE TIME SLOTS — Check which slots are available
# GET /api/appointments/available-slots/?doctor=1&date=2026-05-30
# ═══════════════════════════════════════════════════════════

class AvailableSlotsView(APIView):
    """Returns the available time slots for a specific doctor on a specific date."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    # All possible time slots
    ALL_SLOTS = ["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"]

    def get(self, request):
        doctor_id = request.query_params.get('doctor')
        date_str = request.query_params.get('date')

        if not doctor_id or not date_str:
            return Response({
                'detail': 'Both doctor and date fields are required.'
            }, status=400)

        # Check if doctor exists
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found'}, status=404)

        # Find slots booked on this date (cancelled appointments don't count)
        booked_slots = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date_str,
        ).exclude(
            status='cancelled'
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