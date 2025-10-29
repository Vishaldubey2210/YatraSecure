from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Place(models.Model):
    """Tourist places in India"""
    CATEGORY_CHOICES = [
        ('beach', 'Beach'),
        ('mountain', 'Mountain'),
        ('heritage', 'Heritage Site'),
        ('temple', 'Temple'),
        ('wildlife', 'Wildlife'),
        ('adventure', 'Adventure'),
        ('city', 'City'),
        ('village', 'Village'),
        ('fort', 'Fort'),
        ('palace', 'Palace'),
        ('waterfall', 'Waterfall'),
        ('lake', 'Lake'),
    ]
    
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    best_time_to_visit = models.CharField(max_length=100, blank=True)
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-rating', '-view_count']
    
    def __str__(self):
        return f"{self.name}, {self.city}"
    
    @property
    def photo_count(self):
        return self.photos.count()


class PlacePhoto(models.Model):
    """User uploaded photos of places"""
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='photos')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='explore_photos')
    image = models.ImageField(upload_to='place_photos/%Y/%m/')
    caption = models.TextField(blank=True)
    likes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Photo by {self.user.username} at {self.place.name}"


class PhotoLike(models.Model):
    """Track photo likes"""
    photo = models.ForeignKey(PlacePhoto, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='explore_likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['photo', 'user']
    
    def __str__(self):
        return f"{self.user.username} liked {self.photo.id}"


class PlaceComment(models.Model):
    """Comments on photos"""
    photo = models.ForeignKey(PlacePhoto, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='explore_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username}"
