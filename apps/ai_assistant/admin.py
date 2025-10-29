from django.contrib import admin
from .models import PackingList, AIConversation

@admin.register(PackingList)
class PackingListAdmin(admin.ModelAdmin):
    list_display = ['trip', 'generated_at', 'updated_at']

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'message']
