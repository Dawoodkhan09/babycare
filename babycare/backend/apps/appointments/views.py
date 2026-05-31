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