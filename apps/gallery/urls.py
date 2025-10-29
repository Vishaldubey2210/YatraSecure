from django.urls import path
from . import views

app_name = 'gallery'

urlpatterns = [
    path('<int:trip_id>/', views.gallery_view, name='gallery'),
    path('<int:trip_id>/upload/', views.upload_photo, name='upload'),
    path('photo/<int:photo_id>/like/', views.like_photo, name='like_photo'),
    path('photo/<int:photo_id>/comment/', views.add_comment, name='add_comment'),
]
