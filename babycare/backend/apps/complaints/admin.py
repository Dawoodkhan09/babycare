from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'submitted_by', 'category', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'category', 'created_at')
    search_fields = ('subject', 'description', 'submitted_by__email')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at', 'submitted_by')
    ordering = ('-created_at',)