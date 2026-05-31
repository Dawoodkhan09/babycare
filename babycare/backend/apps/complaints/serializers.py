from rest_framework import serializers
from .models import Complaint


# ═══════════════════════════════════════════════════════════
# SUBMIT — User/Doctor submitting a complaint
# ═══════════════════════════════════════════════════════════

class ComplaintSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = (
            'category', 'subject', 'description',
            'against_doctor', 'against_user',
            'priority', 'attachment',
        )

    def create(self, validated_data):
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)


# ═══════════════════════════════════════════════════════════
# LIST — Showing complaint cards
# ═══════════════════════════════════════════════════════════

class ComplaintListSerializer(serializers.ModelSerializer):
    submitted_by_name  = serializers.SerializerMethodField()
    submitted_by_email = serializers.CharField(source='submitted_by.email', read_only=True)
    submitted_by_role  = serializers.CharField(source='submitted_by.role', read_only=True)

    against_doctor_name = serializers.CharField(source='against_doctor.full_name', read_only=True, allow_null=True)
    against_user_name   = serializers.SerializerMethodField()

    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display   = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Complaint
        fields = (
            'id', 'subject', 'category', 'category_display',
            'priority', 'priority_display',
            'status', 'status_display',
            'submitted_by', 'submitted_by_name', 'submitted_by_email', 'submitted_by_role',
            'against_doctor', 'against_doctor_name',
            'against_user', 'against_user_name',
            'created_at', 'updated_at', 'resolved_at',
        )

    def get_submitted_by_name(self, obj):
        u = obj.submitted_by
        name = f"{u.first_name} {u.last_name}".strip()
        return name or u.email.split('@')[0]

    def get_against_user_name(self, obj):
        if not obj.against_user:
            return None
        u = obj.against_user
        name = f"{u.first_name} {u.last_name}".strip()
        return name or u.email.split('@')[0]


# ═══════════════════════════════════════════════════════════
# DETAIL — Full complaint view (with attachment URL + admin response)
# ═══════════════════════════════════════════════════════════

class ComplaintDetailSerializer(ComplaintListSerializer):
    description = serializers.CharField(read_only=True)
    admin_response = serializers.CharField(read_only=True)
    resolved_by_name = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta(ComplaintListSerializer.Meta):
        fields = ComplaintListSerializer.Meta.fields + (
            'description', 'admin_response', 'attachment_url',
            'resolved_by_name',
        )

    def get_resolved_by_name(self, obj):
        if not obj.resolved_by:
            return None
        u = obj.resolved_by
        return f"{u.first_name} {u.last_name}".strip() or u.email

    def get_attachment_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.attachment.url)
        return obj.attachment.url


# ═══════════════════════════════════════════════════════════
# ADMIN RESPONSE — Admin replying / updating status
# ═══════════════════════════════════════════════════════════

class AdminRespondSerializer(serializers.Serializer):
    admin_response = serializers.CharField(required=True, min_length=5)
    status = serializers.ChoiceField(
        choices=['in_progress', 'resolved', 'closed'],
        required=False,
    )