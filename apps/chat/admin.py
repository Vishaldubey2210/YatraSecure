from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['trip', 'user', 'message', 'is_ai_message', 'created_at']
    list_filter = ['is_ai_message', 'created_at']
    search_fields = ['message', 'user__username']
