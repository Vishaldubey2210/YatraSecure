from django.contrib import admin
from .models import (
    Trip, 
    TripMember, 
    PoolWallet, 
    WalletTransaction, 
    BookingCart, 
    CartItem, 
    Booking,
    SplitBill,
    BillSplit
)


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['name', 'destination', 'start_date', 'end_date', 'status', 'creator', 'trip_code']
    list_filter = ['status', 'trip_type', 'is_public']
    search_fields = ['name', 'destination', 'trip_code']
    readonly_fields = ['trip_code', 'created_at', 'updated_at']


@admin.register(TripMember)
class TripMemberAdmin(admin.ModelAdmin):
    list_display = ['trip', 'user', 'role', 'joined_at']
    list_filter = ['role']


@admin.register(PoolWallet)
class PoolWalletAdmin(admin.ModelAdmin):
    list_display = ['trip', 'total_balance', 'target_amount', 'created_at']


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'user', 'amount', 'transaction_type', 'timestamp']
    list_filter = ['transaction_type']


@admin.register(BookingCart)
class BookingCartAdmin(admin.ModelAdmin):
    list_display = ['trip', 'created_at', 'updated_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'booking_type', 'title', 'price', 'quantity', 'provider']
    list_filter = ['booking_type']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['trip', 'booking_type', 'title', 'amount', 'status', 'booking_reference', 'booked_at']
    list_filter = ['booking_type', 'status']
    search_fields = ['booking_reference', 'title']


@admin.register(SplitBill)
class SplitBillAdmin(admin.ModelAdmin):
    list_display = ['title', 'trip', 'created_by', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'trip__name']


@admin.register(BillSplit)
class BillSplitAdmin(admin.ModelAdmin):
    list_display = ['bill', 'user', 'amount', 'status', 'responded_at']
    list_filter = ['status']
