from django.db import models
from django.contrib.auth import get_user_model
from apps.trips.models import Trip

User = get_user_model()

class PackingList(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='packing_list')
    content = models.TextField()  # JSON format
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Packing List - {self.trip.name}"

class AIConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at}"
