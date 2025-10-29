from django.urls import path
from . import views

app_name = 'safety'

urlpatterns = [
    path('map/', views.safety_map, name='safety_map'),
    path('report/', views.report_safety, name='report_safety'),
    path('sos/', views.sos_alert, name='sos_alert'),
    path('api/news-alerts/', views.get_news_alerts, name='news_alerts'),
]
