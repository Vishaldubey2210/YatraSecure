"""
Root API URLs
"""

from django.urls import path
from . import views

urlpatterns = [
    path('safety-score/', views.safety_score_api, name='safety_score'),
]
