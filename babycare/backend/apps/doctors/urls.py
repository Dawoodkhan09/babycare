from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints
    path('apply/',          views.DoctorApplicationSubmitView.as_view()),
    path('check-status/',   views.CheckApplicationStatusView.as_view()),

    # Admin endpoints
    path('admin/applications/',                views.AdminApplicationListView.as_view()),
    path('admin/applications/<int:pk>/',       views.AdminApplicationDetailView.as_view()),
    path('admin/applications/<int:pk>/approve/', views.AdminApproveApplicationView.as_view()),
    path('admin/applications/<int:pk>/reject/',  views.AdminRejectApplicationView.as_view()),
    path('admin/doctors/',                     views.AdminDoctorListView.as_view()),
    path('admin/stats/',                       views.AdminStatsView.as_view()),
    path('admin/doctors/<int:pk>/toggle-active/', views.AdminToggleDoctorActiveView.as_view()),
    path('admin/doctors/<int:pk>/delete/',        views.AdminDeleteDoctorView.as_view()),
    path('my-profile/', views.MyDoctorProfileView.as_view()),
]