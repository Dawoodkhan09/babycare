from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from datetime import timedelta
from django.utils import timezone


# ═══════════════════════════════════════════════════════════
# Custom User Manager
# (Email-based login ke liye)
# ═══════════════════════════════════════════════════════════

class UserManager(BaseUserManager):
    """
    Yeh manager batata hai ke user kaise create hoga.
    Default mein username chahiye hota hai, hum email use karenge.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """Normal user create karne ke liye"""
        if not email:
            raise ValueError('Email is required.')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)         # Password encrypt karke save karta hai
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Admin user create karne ke liye (createsuperuser command ke liye)"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(email, password, **extra_fields)


# ═══════════════════════════════════════════════════════════
# Custom User Model
# ═══════════════════════════════════════════════════════════

class User(AbstractUser):
    """
    Yeh hamara custom User model hai.
    
    Default Django User mein 'username' field zaroori hota hai.
    Hum usko remove kar ke 'email' ko primary field bana rahe hain.
    """
    
    # ─── Role Choices ───
    class Role(models.TextChoices):
        PARENT = 'parent', 'Parent / Patient'
        DOCTOR = 'doctor', 'Doctor'
        ADMIN  = 'admin',  'Admin'
    
    # ─── Core Fields ───
    username = None                                    # Username NAHI chahiye
    email    = models.EmailField('Email Address', unique=True)
    
    # ─── Extra Fields ───
    role     = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PARENT,
    )
    phone    = models.CharField(max_length=20, blank=True, null=True)
    
    # ─── Verification Status ───
    is_verified = models.BooleanField(
        default=True,
        help_text='For parents, it should be set to True by default. For doctors, it should change to True only after admin verification.'
    )
    
    # ─── Timestamps ───
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ─── Login Configuration ───
    USERNAME_FIELD  = 'email'              # Email se login karenge
    REQUIRED_FIELDS = []                   # Username ke ilawa kuch zaroori nahi
    
    # ─── Manager attach karo ───
    objects = UserManager()
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    # ─── Helper Properties (code clean rakhne ke liye) ───
    @property
    def is_parent(self):
        return self.role == self.Role.PARENT
    
    @property
    def is_doctor_user(self):
        return self.role == self.Role.DOCTOR
    
    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
    


class PasswordResetOTP(models.Model):
    """
    Password reset OTP — 6 digit code that expires in 10 minutes.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reset_otps',
    )
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # OTP 10 minutes ke liye valid
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """OTP valid hai ya nahi check kare"""
        return (
            not self.is_used 
            and timezone.now() < self.expires_at
        )
    
    def __str__(self):
        return f"OTP for {self.user.email} — {'Used' if self.is_used else 'Active'}"