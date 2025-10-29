from django.contrib import admin
from .models import Place, PlacePhoto, PhotoLike, PlaceComment


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'category', 'rating', 'view_count', 'photo_count']
    list_filter = ['category', 'state']
    search_fields = ['name', 'city', 'state']


@admin.register(PlacePhoto)
class PlacePhotoAdmin(admin.ModelAdmin):
    list_display = ['place', 'user', 'likes_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['place__name', 'user__username']


@admin.register(PhotoLike)
class PhotoLikeAdmin(admin.ModelAdmin):
    list_display = ['photo', 'user', 'created_at']


@admin.register(PlaceComment)
class PlaceCommentAdmin(admin.ModelAdmin):
    list_display = ['photo', 'user', 'text', 'created_at']
    list_filter = ['created_at']
