from django.contrib import admin
from .models import TravelBadge, VibeMatch

@admin.register(TravelBadge)
class TravelBadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'earned_at']

@admin.register(VibeMatch)
class VibeMatchAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'match_score', 'created_at']
