from django.contrib import admin
from .models import TripPhoto, PhotoLike, PhotoComment

@admin.register(TripPhoto)
class TripPhotoAdmin(admin.ModelAdmin):
    list_display = ['trip', 'uploaded_by', 'location', 'uploaded_at']
    list_filter = ['trip', 'uploaded_at']
    search_fields = ['caption', 'location']

@admin.register(PhotoLike)
class PhotoLikeAdmin(admin.ModelAdmin):
    list_display = ['photo', 'user', 'created_at']

@admin.register(PhotoComment)
class PhotoCommentAdmin(admin.ModelAdmin):
    list_display = ['photo', 'user', 'text', 'created_at']
