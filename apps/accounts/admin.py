from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, EmergencyContact


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_profile_complete']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'travel_vibe']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Information', {
            'fields': ('phone', 'profile_pic', 'bio', 'travel_vibe', 'home_location', 'is_profile_complete', 'points')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('phone', 'travel_vibe')
        }),
    )


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'phone', 'relationship', 'is_primary']
    list_filter = ['is_primary', 'relationship']
    search_fields = ['name', 'user__username', 'phone']
