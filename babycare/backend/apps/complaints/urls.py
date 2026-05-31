from django.urls import path
from . import views

urlpatterns = [
    # Submit & My complaints (user/doctor)
    path('submit/',         views.ComplaintSubmitView.as_view()),
    path('my/',             views.MyComplaintsView.as_view()),
    path('my/<int:pk>/',    views.MyComplaintDetailView.as_view()),
    path('categories/',     views.ComplaintCategoriesView.as_view()),

    # Admin endpoints
    path('admin/',                       views.AdminComplaintsListView.as_view()),
    path('admin/stats/',                 views.AdminComplaintsStatsView.as_view()),
    path('admin/<int:pk>/',              views.AdminComplaintDetailView.as_view()),
    path('admin/<int:pk>/respond/',      views.AdminRespondView.as_view()),
]