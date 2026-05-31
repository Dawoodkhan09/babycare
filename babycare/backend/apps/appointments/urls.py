from django.urls import path
from . import views

urlpatterns = [
    path('doctors/',          views.PublicDoctorListView.as_view()),
    path('book/',             views.BookAppointmentView.as_view()),
    path('my/',               views.MyAppointmentsView.as_view()),
    path('doctor/',           views.DoctorAppointmentsView.as_view()),
    path('<int:pk>/status/',  views.UpdateAppointmentStatusView.as_view()),
]