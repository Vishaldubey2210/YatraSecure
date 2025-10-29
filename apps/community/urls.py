from django.urls import path
from . import views

app_name = 'community'

urlpatterns = [
    path('discover/', views.discover_view, name='discover'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
]
