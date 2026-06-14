from django.db import models
from django.conf import settings
from apps.doctors.models import DoctorProfile


class Complaint(models.Model):
    """
    User ya Doctor complaint karta hai.
    Admin review karke respond karta hai.
    """

    class Category(models.TextChoices):
        AGAINST_DOCTOR  = 'against_doctor',  'Against Doctor'
        AGAINST_USER    = 'against_user',    'Against User'
        SYSTEM_ISSUE    = 'system_issue',    'System / Technical Issue'
        PAYMENT_ISSUE   = 'payment_issue',   'Payment Issue'
        APPOINTMENT     = 'appointment',     'Appointment Issue'
        FEEDBACK        = 'feedback',        'General Feedback'
        OTHER           = 'other',           'Other'

    class Priority(models.TextChoices):
        LOW    = 'low',    'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH   = 'high',   'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        OPEN         = 'open',         'Open'
        IN_PROGRESS  = 'in_progress',  'In Progress'
        RESOLVED     = 'resolved',     'Resolved'
        CLOSED       = 'closed',       'Closed'

    # ─── Who filed it ───
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints_submitted',
    )

    # ─── Optional: Against whom ───
    against_doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaints_against',
        help_text='If there is a complaint against the doctor',
    )
    against_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaints_against_me',
        help_text='If there is a complaint against the user',
    )

    # ─── Complaint details ───
    category = models.CharField(max_length=20, choices=Category.choices)
    subject  = models.CharField(max_length=200)
    description = models.TextField()

    # ─── Optional: file attachment (screenshot, document) ───
    attachment = models.FileField(upload_to='complaints/', blank=True, null=True)

    # ─── Status & priority ───
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status   = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)

    # ─── Admin response ───
    admin_response = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaints_resolved',
    )

    # ─── Timestamps ───
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} — by {self.submitted_by.email} ({self.status})"