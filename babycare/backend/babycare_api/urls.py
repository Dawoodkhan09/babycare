from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.doctors.views import symptom_check_ai  # ← NEW

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.accounts.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/ai/', include('apps.ai.urls')),
    path('api/symptom-check/', symptom_check_ai, name='symptom-check-ai'),
]

# Media files serve karne ke liye (development mein)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)