"""
Views — API endpoints ka logic.

Har view ek specific API endpoint handle karta hai:
- RegisterView → POST /api/auth/register/
- LoginView    → POST /api/auth/login/
- MeView       → GET  /api/auth/me/
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    get_tokens_for_user,
)


# ═══════════════════════════════════════════════════════════
# 1. REGISTER VIEW
# Endpoint: POST /api/auth/register/
# ═══════════════════════════════════════════════════════════

class RegisterView(generics.CreateAPIView):
    """
    Naya parent user register karta hai.
    
    Body (JSON):
    {
        "email":      "parent@test.com",
        "password":   "Test1234",
        "first_name": "Sara",
        "last_name":  "Ahmed",
        "phone":      "0321-1234567"
    }
    
    Response (success):
    {
        "user":   { ...user info... },
        "tokens": {
            "access":  "eyJ0eXAi...",
            "refresh": "eyJ0eXAi..."
        },
        "message": "Account successfully created!"
    }
    """
    
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]      # Login ki zaroorat nahi
    
    def create(self, request, *args, **kwargs):
        # 1. Serializer ke through data validate karo
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. User database mein save karo
        user = serializer.save()
        
        # 3. Saath mein JWT tokens bhi generate karke do (taake direct login ho jaye)
        tokens = get_tokens_for_user(user)
        
        # 4. Response bhejo
        return Response({
            'user':    UserSerializer(user).data,
            'tokens':  tokens,
            'message': 'Account successfully created! 🎉'
        }, status=status.HTTP_201_CREATED)


# ═══════════════════════════════════════════════════════════
# 2. LOGIN VIEW
# Endpoint: POST /api/auth/login/
# ═══════════════════════════════════════════════════════════

class LoginView(APIView):
    """
    User login karne ke liye.
    
    Body (JSON):
    {
        "email":    "parent@test.com",
        "password": "Test1234"
    }
    
    Response (success):
    {
        "user":   { ...user info... },
        "tokens": {
            "access":  "eyJ0eXAi...",
            "refresh": "eyJ0eXAi..."
        },
        "message": "Login successful!"
    }
    """
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # 1. Data validate karo serializer ke through
        serializer = LoginSerializer(
            data    = request.data,
            context = {'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # 2. User mil gaya (serializer ne validate kar liya)
        user = serializer.validated_data['user']
        
        # 3. JWT tokens generate karo
        tokens = get_tokens_for_user(user)
        
        # 4. Response bhejo
        return Response({
            'user':    UserSerializer(user).data,
            'tokens':  tokens,
            'message': f'Welcome back, {user.first_name or user.email}! 👋'
        }, status=status.HTTP_200_OK)


# ═══════════════════════════════════════════════════════════
# 3. "ME" VIEW (Currently logged-in user)
# Endpoint: GET /api/auth/me/
# ═══════════════════════════════════════════════════════════

class MeView(APIView):
    """
    Currently logged-in user ki info return karta hai.
    Login zaroori hai (JWT token chahiye).
    
    Headers:
    Authorization: Bearer <access_token>
    
    Response:
    {
        "user": { ...user info... }
    }
    """
    
    permission_classes = [permissions.IsAuthenticated]      # Login zaroori
    
    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        })
    

# ═══════════════════════════════════════════════════════════
# PASSWORD RESET VIEWS
# ═══════════════════════════════════════════════════════════

import random
from django.utils import timezone
from .models import User, PasswordResetOTP
from .serializers import (
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)


def generate_otp():
    """6-digit OTP generate kare"""
    return str(random.randint(100000, 999999))


# ─── Step 1: Forgot Password — Send OTP ───
class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        # User dhundo
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Security: same response chahe email exist kare ya na kare
            # (taake attacker ko pata na chale kaunsa email registered hai)
            return Response({
                'message': 'Agar yeh email registered hai, to OTP bhej diya gaya hai.',
                'email': email,
            })
        
        # Purane unused OTPs delete kar do (clean database)
        PasswordResetOTP.objects.filter(user=user, is_used=False).delete()
        
        # Naya OTP generate karo
        otp_code = generate_otp()
        PasswordResetOTP.objects.create(
            user=user,
            otp_code=otp_code,
        )
        
        # PRETEND EMAIL — CMD pe print
        print("\n" + "═" * 60)
        print("📧 PRETEND EMAIL — PASSWORD RESET OTP")
        print("═" * 60)
        print(f"To:      {user.email}")
        print(f"Subject: Password Reset Code — BabyCare")
        print(f"")
        print(f"Hello {user.first_name or 'User'},")
        print(f"")
        print(f"Aap ka password reset OTP code yeh hai:")
        print(f"")
        print(f"  🔐 OTP: {otp_code}")
        print(f"")
        print(f"Yeh code 10 minutes ke liye valid hai.")
        print(f"Agar aap ne reset request nahi ki, to is email ko ignore karein.")
        print("═" * 60 + "\n")
        
        return Response({
            'message': 'OTP successfully bheja gaya. Email check karein.',
            'email': email,
            # ⚠️ DEVELOPMENT MODE ONLY — production mein yeh remove karna
            'debug_otp': otp_code,
        })


# ─── Step 2: Verify OTP (Optional - user step) ───
class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Body: { "email": "...", "otp_code": "123456" }
    
    Returns success if OTP is valid (used in next step).
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        
        try:
            user = User.objects.get(email=email)
            otp = PasswordResetOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                is_used=False,
            ).latest('created_at')
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({
                'detail': 'Galat OTP code. Dobara try karein.'
            }, status=400)
        
        if not otp.is_valid():
            return Response({
                'detail': 'OTP expire ho gaya hai. Naya OTP request karein.'
            }, status=400)
        
        return Response({
            'message': 'OTP verified! Naya password set karein.',
            'email': email,
        })


# ─── Step 3: Reset Password ───
class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Body: { "email": "...", "otp_code": "123456", "new_password": "..." }
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        new_password = serializer.validated_data['new_password']
        
        # User dhundo
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)
        
        # OTP dhundo
        try:
            otp = PasswordResetOTP.objects.filter(
                user=user,
                otp_code=otp_code,
                is_used=False,
            ).latest('created_at')
        except PasswordResetOTP.DoesNotExist:
            return Response({
                'detail': 'Galat OTP code.'
            }, status=400)
        
        # OTP validity check
        if not otp.is_valid():
            return Response({
                'detail': 'OTP expire ho gaya hai. Naya OTP request karein.'
            }, status=400)
        
        # Password update karo
        user.set_password(new_password)
        user.save()
        
        # OTP used mark karo
        otp.is_used = True
        otp.save()
        
        # Pretend confirmation email
        print("\n" + "═" * 60)
        print("📧 PRETEND EMAIL — PASSWORD CHANGED")
        print("═" * 60)
        print(f"To: {user.email}")
        print(f"Subject: Password Successfully Changed — BabyCare")
        print(f"")
        print(f"Hello {user.first_name or 'User'},")
        print(f"")
        print(f"Aap ka password successfully change ho gaya hai.")
        print(f"Agar yeh aap ne nahi kiya, to fauran admin se contact karein.")
        print("═" * 60 + "\n")
        
        return Response({
            'message': 'Password successfully change ho gaya! Ab login karein.',
        })