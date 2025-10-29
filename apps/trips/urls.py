from django.urls import path
from . import views

app_name = 'trips'

urlpatterns = [
    # Trip Management
    path('', views.trip_list, name='trip_list'),
    path('create/', views.create_trip, name='create_trip'),
    path('join/', views.join_trip, name='join_trip'),
    path('<int:trip_id>/', views.trip_detail, name='trip_detail'),
    
    # Booking System
    path('<int:trip_id>/bookings/search/', views.booking_search, name='booking_search'),
    path('<int:trip_id>/bookings/add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('<int:trip_id>/cart/', views.view_cart, name='view_cart'),
    path('<int:trip_id>/cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('<int:trip_id>/checkout/', views.checkout_cart, name='checkout_cart'),
    path('<int:trip_id>/bookings/', views.bookings_list, name='bookings_list'),
    
    # Pool Wallet
    path('<int:trip_id>/wallet/', views.pool_wallet_view, name='pool_wallet'),
    path('<int:trip_id>/wallet/contribute/', views.contribute_wallet, name='contribute_wallet'),
    # Add to existing urlpatterns
    # Split Bills
    path('<int:trip_id>/split-bills/', views.split_bill_list, name='split_bill_list'),
    path('<int:trip_id>/split-bills/create/', views.create_split_bill, name='create_split_bill'),
    path('<int:trip_id>/split-bills/<int:bill_id>/', views.split_bill_detail, name='split_bill_detail'),
    path('<int:trip_id>/split-bills/respond/<int:split_id>/', views.respond_to_split, name='respond_to_split'),
    path('<int:trip_id>/split-bills/mark-paid/<int:split_id>/', views.mark_split_paid, name='mark_split_paid'),



]
