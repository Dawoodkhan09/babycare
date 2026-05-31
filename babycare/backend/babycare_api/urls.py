from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints (future mein yahan apps add karenge)
    # path('api/auth/', include('apps.accounts.urls')),
    # path('api/doctors/', include('apps.doctors.urls')),

    path('api/auth/', include('apps.accounts.urls')),
     path('api/doctors/', include('apps.doctors.urls')),
     path('api/appointments/', include('apps.appointments.urls')),
     path('api/complaints/',   include('apps.complaints.urls')),
]

# Media files serve karne ke liye (development mein)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)