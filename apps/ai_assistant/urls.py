from django.urls import path
from . import views

app_name = 'ai_assistant'

urlpatterns = [
    # Chat-based generation
    path('itinerary/<int:trip_id>/', views.generate_itinerary_view, name='generate_itinerary'),
    path('itinerary/<int:trip_id>/chat/', views.chat_generate_api, name='chat_generate'),
    path('itinerary/<int:trip_id>/save-generated/', views.save_generated_itinerary, name='save_generated'),
    
    # View and edit saved
    path('itinerary/<int:trip_id>/view/', views.view_saved_itinerary, name='view_itinerary'),
    path('itinerary/<int:trip_id>/ai-edit/', views.ai_edit_api, name='ai_edit'),
    path('itinerary/<int:trip_id>/save/', views.save_edited_itinerary, name='save_itinerary'),
    
    # Packing list
    path('packing/<int:trip_id>/', views.generate_packing_view, name='generate_packing'),
    
    # General chat
    path('chat/', views.chat_view, name='chat'),
    path('chat/api/', views.chat_api, name='chat_api'),
]
