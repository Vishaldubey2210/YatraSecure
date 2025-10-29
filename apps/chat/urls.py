from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('<int:trip_id>/', views.group_chat, name='group_chat'),
    path('<int:trip_id>/send/', views.send_message, name='send_message'),
]
