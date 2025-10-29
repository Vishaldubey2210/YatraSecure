from django.contrib import admin
from .models import Expense, Settlement

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['description', 'amount', 'category', 'paid_by', 'trip', 'date']
    list_filter = ['category', 'date', 'trip']
    search_fields = ['description', 'paid_by__username']

@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'amount', 'trip', 'is_settled', 'created_at']
    list_filter = ['is_settled', 'trip']
