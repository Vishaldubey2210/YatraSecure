from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TravelBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)  # FontAwesome icon class
    description = models.TextField()
    earned_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"

class VibeMatch(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches_as_user2')
    match_score = models.IntegerField(default=0)  # 0-100
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user1.username} <-> {self.user2.username} ({self.match_score}%)"
