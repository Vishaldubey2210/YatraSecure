from django.urls import path
from . import views

app_name = 'explore'

urlpatterns = [
    path('', views.explore_home, name='explore_home'),
    path('search/', views.search_places, name='search_places'),
    path('place/<int:place_id>/', views.place_detail, name='place_detail'),
    path('place/<int:place_id>/upload/', views.upload_photo, name='upload_photo'),
    path('photo/<int:photo_id>/like/', views.like_photo, name='like_photo'),
    path('photo/<int:photo_id>/comment/', views.add_comment, name='add_comment'),
]
