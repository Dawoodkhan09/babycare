from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import Complaint
from .serializers import (
    ComplaintSubmitSerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    AdminRespondSerializer,
)


# ═══════════════════════════════════════════════════════════
# Permission: Admin Only
# ═══════════════════════════════════════════════════════════

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


# ═══════════════════════════════════════════════════════════
# 1. SUBMIT a complaint (User/Doctor)
# POST /api/complaints/submit/
# ═══════════════════════════════════════════════════════════

class ComplaintSubmitView(generics.CreateAPIView):
    serializer_class = ComplaintSubmitSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        return Response({
            'message': 'Complaint submitted successfully! Admin team review karegi.',
            'complaint': ComplaintListSerializer(complaint).data,
        }, status=201)


# ═══════════════════════════════════════════════════════════
# 2. MY COMPLAINTS — Submitted by current user
# GET /api/complaints/my/
# ═══════════════════════════════════════════════════════════

class MyComplaintsView(generics.ListAPIView):
    serializer_class = ComplaintListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(submitted_by=self.request.user)


# ═══════════════════════════════════════════════════════════
# 3. MY COMPLAINT DETAIL
# GET /api/complaints/my/{id}/
# ═══════════════════════════════════════════════════════════

class MyComplaintDetailView(generics.RetrieveAPIView):
    serializer_class = ComplaintDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(submitted_by=self.request.user)


# ═══════════════════════════════════════════════════════════
# 4. ADMIN — List ALL complaints (with filters)
# GET /api/complaints/admin/?status=open&priority=high&category=against_doctor
# ═══════════════════════════════════════════════════════════

class AdminComplaintsListView(generics.ListAPIView):
    serializer_class = ComplaintListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Complaint.objects.all().select_related('submitted_by', 'against_doctor', 'against_user')

        status_filter = self.request.query_params.get('status')
        priority_filter = self.request.query_params.get('priority')
        category_filter = self.request.query_params.get('category')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if priority_filter:
            qs = qs.filter(priority=priority_filter)
        if category_filter:
            qs = qs.filter(category=category_filter)

        return qs


# ═══════════════════════════════════════════════════════════
# 5. ADMIN — Complaint Detail
# GET /api/complaints/admin/{id}/
# ═══════════════════════════════════════════════════════════

class AdminComplaintDetailView(generics.RetrieveAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintDetailSerializer
    permission_classes = [IsAdminUser]


# ═══════════════════════════════════════════════════════════
# 6. ADMIN — Respond / Update Status
# POST /api/complaints/admin/{id}/respond/
# Body: { "admin_response": "...", "status": "resolved" }
# ═══════════════════════════════════════════════════════════

class AdminRespondView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'detail': 'Complaint not found'}, status=404)

        serializer = AdminRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        complaint.admin_response = serializer.validated_data['admin_response']
        new_status = serializer.validated_data.get('status')
        if new_status:
            complaint.status = new_status
            if new_status in ['resolved', 'closed']:
                complaint.resolved_at = timezone.now()
                complaint.resolved_by = request.user

        complaint.save()

        return Response({
            'message': 'Response sent successfully',
            'complaint': ComplaintDetailSerializer(complaint, context={'request': request}).data,
        })


# ═══════════════════════════════════════════════════════════
# 7. ADMIN — Stats
# GET /api/complaints/admin/stats/
# ═══════════════════════════════════════════════════════════

class AdminComplaintsStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'total':       Complaint.objects.count(),
            'open':        Complaint.objects.filter(status='open').count(),
            'in_progress': Complaint.objects.filter(status='in_progress').count(),
            'resolved':    Complaint.objects.filter(status='resolved').count(),
            'closed':      Complaint.objects.filter(status='closed').count(),
            'urgent':      Complaint.objects.filter(priority='urgent').count(),
            'against_doctors': Complaint.objects.filter(category='against_doctor').count(),
        })


# ═══════════════════════════════════════════════════════════
# 8. PUBLIC — Available Categories (for dropdown)
# GET /api/complaints/categories/
# ═══════════════════════════════════════════════════════════

class ComplaintCategoriesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'categories': [
                {'value': c[0], 'label': c[1]}
                for c in Complaint.Category.choices
            ],
            'priorities': [
                {'value': p[0], 'label': p[1]}
                for p in Complaint.Priority.choices
            ],
        })