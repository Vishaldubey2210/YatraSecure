from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    TRAVEL_VIBE_CHOICES = [
        ('adventure', 'Adventure Seeker'),
        ('beach', 'Beach Lover'),
        ('cultural', 'Culture Explorer'),
        ('wildlife', 'Wildlife Enthusiast'),
        ('pilgrimage', 'Spiritual Traveler'),
        ('luxury', 'Luxury Traveler'),
        ('budget', 'Budget Backpacker'),
    ]
    
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    travel_vibe = models.CharField(max_length=50, choices=TRAVEL_VIBE_CHOICES, blank=True, null=True)
    home_location = models.CharField(max_length=255, blank=True, null=True)
    is_profile_complete = models.BooleanField(default=False)
    points = models.IntegerField(default=0)  # Gamification points
    
    def __str__(self):
        return self.username
    
    class Meta:
        db_table = 'accounts_user'


class EmergencyContact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    whatsapp = models.CharField(max_length=15, blank=True, null=True)
    relationship = models.CharField(max_length=100)
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
