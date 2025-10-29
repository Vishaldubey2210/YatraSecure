from django.contrib import admin
from .models import SafetyReport, GeoFence, SOSAlert

@admin.register(SafetyReport)
class SafetyReportAdmin(admin.ModelAdmin):
    list_display = ['location', 'safety_score', 'user', 'created_at']
    list_filter = ['safety_score', 'created_at']
    search_fields = ['location', 'user__username']

@admin.register(GeoFence)
class GeoFenceAdmin(admin.ModelAdmin):
    list_display = ['name', 'trip', 'radius_km', 'is_active', 'created_at']
    list_filter = ['is_active']

@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'trip', 'is_resolved', 'created_at']
    list_filter = ['is_resolved', 'created_at']
