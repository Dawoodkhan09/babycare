from django.urls import path
from . import views

urlpatterns = [
    path('symptoms/', views.SymptomListView.as_view(), name='ai-symptoms'),
    path('diagnose/', views.DiagnoseView.as_view(), name='ai-diagnose'),
]
