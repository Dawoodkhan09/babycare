"""
Accounts URLs — Authentication API routes.

Saari URLs '/api/auth/' se shuru hongi (main urls.py mein set karenge).
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, MeView,
    ForgotPasswordView, VerifyOTPView, ResetPasswordView,    
)


urlpatterns = [
    # POST /api/auth/register/   → Parent register
    path('register/', RegisterView.as_view(), name='register'),
    
    # POST /api/auth/login/      → Login (parent + doctor)
    path('login/',    LoginView.as_view(),    name='login'),
    
    # GET  /api/auth/me/         → Currently logged-in user info
    path('me/',       MeView.as_view(),       name='me'),
    
    # POST /api/auth/refresh/    → Access token refresh
    path('refresh/',  TokenRefreshView.as_view(), name='token_refresh'),

     path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/',      VerifyOTPView.as_view(),      name='verify_otp'),
    path('reset-password/',  ResetPasswordView.as_view(),  name='reset_password'),
]