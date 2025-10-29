from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.landing_view, name='landing'),
    path('dashboard/', views.home_view, name='home'),
    path('api/nearby-facilities/', views.get_nearby_facilities, name='nearby_facilities'),
    path('api/safety-score/', views.get_location_safety_score, name='safety_score'),
]
