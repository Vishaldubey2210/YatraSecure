from django.db import models
from django.contrib.auth import get_user_model
from apps.trips.models import Trip

User = get_user_model()

class SafetyReport(models.Model):
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    safety_score = models.IntegerField(default=50)  # 0-100
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='safety_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.location} - Score: {self.safety_score}"

class GeoFence(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='geofences')
    name = models.CharField(max_length=100)
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.trip.name}"

class SOSAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sos_alerts')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='sos_alerts', null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    message = models.TextField(default="Emergency SOS Alert!")
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"SOS - {self.user.username} at {self.created_at}"
