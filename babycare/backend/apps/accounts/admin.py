from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Admin panel mein User model ka display."""
    
    list_display = ('email', 'role', 'first_name', 'last_name', 'is_verified', 'is_active', 'created_at')
    list_filter   = ('role', 'is_verified', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering      = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info',     {'fields': ('first_name', 'last_name', 'phone')}),
        ('Role & Status',     {'fields': ('role', 'is_verified')}),
        ('Permissions',       {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates',   {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_verified'),
        }),
    )