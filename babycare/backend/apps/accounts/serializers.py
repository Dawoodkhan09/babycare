"""
Serializers — JSON aur Python objects ke beech converter.
Yeh DRF ka core concept hai.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# ═══════════════════════════════════════════════════════════
# 1. USER REGISTRATION SERIALIZER
# (Naye parent register karne ke liye)
# ═══════════════════════════════════════════════════════════

class RegisterSerializer(serializers.ModelSerializer):
    """
    Yeh serializer parent register karne ke liye hai.
    
    Frontend (React) yeh JSON bhejega:
    {
        "email":      "parent@test.com",
        "password":   "Test1234",
        "first_name": "Sara",
        "last_name":  "Ahmed",
        "phone":      "0321-1234567"
    }
    """
    
    # Password ko special handle karte hain — write_only matlab JSON response mein wapas nahi jayega
    password = serializers.CharField(
        write_only=True,           # Response mein nahi dikhega
        min_length=8,              # Kam se kam 8 character
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        # Yeh fields user provide karega
        fields = ('email', 'password', 'first_name', 'last_name', 'phone')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name':  {'required': False},
            'phone':      {'required': False},
        }
    
    def create(self, validated_data):
        """
        Jab serializer.save() call hota hai, yeh function chalti hai.
        Yahan hum actual user database mein banate hain.
        """
        user = User.objects.create_user(
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
            phone      = validated_data.get('phone', ''),
            role       = User.Role.PARENT,           # Default: Parent
            is_verified = True,                      # Parent ko verification ki zaroorat nahi
        )
        return user


# ═══════════════════════════════════════════════════════════
# 2. LOGIN SERIALIZER
# (Email + password se login ke liye)
# ═══════════════════════════════════════════════════════════

class LoginSerializer(serializers.Serializer):
    """
    Login ke liye serializer.
    
    Frontend yeh bhejega:
    {
        "email":    "parent@test.com",
        "password": "Test1234"
    }
    """
    
    email    = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Yahan hum check karte hain ke email + password correct hain ya nahi.
        """
        email    = attrs.get('email')
        password = attrs.get('password')
        
        # Django ka built-in authenticate function use karte hain
        user = authenticate(
            request  = self.context.get('request'),
            email    = email,
            password = password,
        )
        
        # Agar credentials galat hain
        if not user:
            raise serializers.ValidationError({
                'detail': 'Galat email ya password. Dobara try karein.'
            })
        
        # Agar account inactive hai
        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'Aap ka account abhi inactive hai. Admin se contact karein.'
            })
        
        # Agar doctor hai aur verify nahi hua
        if user.is_doctor_user and not user.is_verified:
            raise serializers.ValidationError({
                'detail': 'Aap ki doctor verification abhi pending hai.'
            })
        
        # Sab sahi hai — user ko attrs mein add kar do
        attrs['user'] = user
        return attrs


# ═══════════════════════════════════════════════════════════
# 3. USER INFO SERIALIZER
# (Currently logged-in user ki info return karne ke liye)
# ═══════════════════════════════════════════════════════════

class UserSerializer(serializers.ModelSerializer):
    """
    User ki public info return karta hai (password ke bagair).
    """
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'phone',
            'role', 'role_display', 'is_verified', 'created_at'
        )
        read_only_fields = ('id', 'role', 'is_verified', 'created_at')


# ═══════════════════════════════════════════════════════════
# Helper: JWT Tokens Generate Karna
# ═══════════════════════════════════════════════════════════

def get_tokens_for_user(user):
    """
    User ke liye JWT tokens (access + refresh) generate karta hai.
    """
    refresh = RefreshToken.for_user(user)
    
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


# ═══════════════════════════════════════════════════════════
# PASSWORD RESET SERIALIZERS
# ═══════════════════════════════════════════════════════════

class ForgotPasswordSerializer(serializers.Serializer):
    """Step 1: User email daale"""
    email = serializers.EmailField(required=True)


class VerifyOTPSerializer(serializers.Serializer):
    """Step 2: User OTP daale"""
    email    = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Step 3: Naya password set karo"""
    email        = serializers.EmailField(required=True)
    otp_code     = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)