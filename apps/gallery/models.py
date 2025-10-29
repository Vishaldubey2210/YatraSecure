from django.db import models
from django.contrib.auth import get_user_model
from apps.trips.models import Trip

User = get_user_model()

class TripPhoto(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='photos')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_photos')
    image = models.ImageField(upload_to='trip_photos/')
    caption = models.CharField(max_length=500, blank=True)
    location = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Photo by {self.uploaded_by.username} - {self.trip.name}"

class PhotoLike(models.Model):
    photo = models.ForeignKey(TripPhoto, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['photo', 'user']
    
    def __str__(self):
        return f"{self.user.username} liked photo {self.photo.id}"

class PhotoComment(models.Model):
    photo = models.ForeignKey(TripPhoto, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username}"
