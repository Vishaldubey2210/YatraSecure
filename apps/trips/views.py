from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum
from .models import (
    Trip, TripMember, PoolWallet, WalletTransaction, 
    BookingCart, CartItem, Booking, SplitBill, BillSplit
)
from .booking_service import search_flights, search_trains, search_cabs, search_hotels, search_restaurants
import secrets
import string
import uuid
from decimal import Decimal


def generate_trip_code():
    """Generate unique 6-character trip code"""
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(secrets.choice(characters) for _ in range(6))
        if not Trip.objects.filter(trip_code=code).exists():
            return code


def generate_transaction_hash():
    """Generate mock Web3-style transaction hash"""
    return '0x' + ''.join(secrets.choice('0123456789abcdef') for _ in range(64))


# ==================== TRIP MANAGEMENT ====================

@login_required
def trip_list(request):
    """List all trips for logged-in user"""
    user_trips = Trip.objects.filter(members=request.user).order_by('-created_at')
    
    context = {
        'trips': user_trips,
    }
    return render(request, 'trips/trip_list.html', context)


@login_required
def create_trip(request):
    """Create new trip"""
    if request.method == 'POST':
        name = request.POST.get('name')
        origin = request.POST.get('origin')
        destination = request.POST.get('destination')
        start_date = request.POST.get('start_date')
        end_date = request.POST.get('end_date')
        budget = request.POST.get('budget')
        trip_type = request.POST.get('trip_type')
        description = request.POST.get('description', '')
        
        trip_code = generate_trip_code()
        
        trip = Trip.objects.create(
            name=name,
            origin=origin,
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
            trip_type=trip_type,
            description=description,
            trip_code=trip_code,
            creator=request.user
        )
        
        TripMember.objects.create(
            trip=trip,
            user=request.user,
            role='creator'
        )
        
        # Create pool wallet
        PoolWallet.objects.create(
            trip=trip,
            target_amount=budget
        )
        
        # Create booking cart
        BookingCart.objects.create(trip=trip)
        
        messages.success(request, f'Trip "{name}" created successfully! Share code: {trip_code}')
        return redirect('trips:trip_detail', trip_id=trip.id)
    
    return render(request, 'trips/create_trip.html')


@login_required
def trip_detail(request, trip_id):
    """View trip details"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'You do not have access to this trip.')
        return redirect('trips:trip_list')
    
    members = trip.members.all()
    
    # Get pool wallet
    pool_wallet = None
    member_contributions = []
    
    try:
        pool_wallet = trip.pool_wallet
        
        # Calculate contributions per member
        for member in trip.members.all():
            total_contributed = pool_wallet.transactions.filter(
                user=member,
                transaction_type='contribution'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            if total_contributed > 0:
                member_contributions.append({
                    'user': member,
                    'amount': total_contributed
                })
        
        # Sort by amount descending
        member_contributions.sort(key=lambda x: x['amount'], reverse=True)
        
    except PoolWallet.DoesNotExist:
        pool_wallet = PoolWallet.objects.create(
            trip=trip,
            target_amount=trip.budget
        )
    
    # Get cart
    cart = None
    try:
        cart = trip.booking_cart
    except BookingCart.DoesNotExist:
        cart = BookingCart.objects.create(trip=trip)
    
    context = {
        'trip': trip,
        'members': members,
        'is_creator': trip.creator == request.user,
        'pool_wallet': pool_wallet,
        'member_contributions': member_contributions,
        'cart': cart,
    }
    return render(request, 'trips/trip_detail.html', context)


@login_required
def join_trip(request):
    """Join trip using trip code"""
    if request.method == 'POST':
        trip_code = request.POST.get('trip_code', '').strip().upper()
        
        try:
            trip = Trip.objects.get(trip_code=trip_code)
            
            if trip.members.filter(id=request.user.id).exists():
                messages.warning(request, 'You are already a member of this trip.')
            else:
                TripMember.objects.create(
                    trip=trip,
                    user=request.user,
                    role='member'
                )
                messages.success(request, f'Successfully joined trip: {trip.name}')
                return redirect('trips:trip_detail', trip_id=trip.id)
        except Trip.DoesNotExist:
            messages.error(request, 'Invalid trip code. Please check and try again.')
    
    return render(request, 'trips/join_trip.html')


# ==================== BOOKING SYSTEM ====================

@login_required
def booking_search(request, trip_id):
    """Search for bookings with filters"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    booking_type = request.GET.get('type', 'flight')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    
    budget_range = None
    if min_price and max_price:
        budget_range = (int(min_price), int(max_price))
    
    results = []
    
    if booking_type == 'flight':
        results = search_flights(trip.origin, trip.destination, trip.start_date, budget_range)
    elif booking_type == 'train':
        results = search_trains(trip.origin, trip.destination, trip.start_date, budget_range)
    elif booking_type == 'cab':
        results = search_cabs(trip.origin, trip.destination, trip.start_date, budget_range)
    elif booking_type == 'hotel':
        results = search_hotels(trip.destination, trip.start_date, trip.end_date, budget_range)
    elif booking_type == 'restaurant':
        results = search_restaurants(trip.destination, budget_range=budget_range)
    
    context = {
        'trip': trip,
        'booking_type': booking_type,
        'results': results,
    }
    return render(request, 'trips/booking_search.html', context)


@login_required
def add_to_cart(request, trip_id):
    """Add item to booking cart"""
    if request.method == 'POST':
        trip = get_object_or_404(Trip, id=trip_id)
        
        if not trip.members.filter(id=request.user.id).exists():
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        cart, created = BookingCart.objects.get_or_create(trip=trip)
        
        CartItem.objects.create(
            cart=cart,
            booking_type=request.POST.get('booking_type'),
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            price=request.POST.get('price'),
            quantity=int(request.POST.get('quantity', 1)),
            booking_url=request.POST.get('url', ''),
            provider=request.POST.get('provider'),
            metadata={}
        )
        
        return JsonResponse({
            'status': 'success',
            'cart_count': cart.item_count,
            'cart_total': float(cart.total_amount)
        })
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


@login_required
def view_cart(request, trip_id):
    """View booking cart"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    cart = trip.booking_cart if hasattr(trip, 'booking_cart') else None
    pool_wallet = trip.pool_wallet if hasattr(trip, 'pool_wallet') else None
    
    context = {
        'trip': trip,
        'cart': cart,
        'pool_wallet': pool_wallet,
        'is_creator': trip.creator == request.user,
    }
    return render(request, 'trips/cart.html', context)


@login_required
def remove_from_cart(request, trip_id, item_id):
    """Remove item from cart"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    item = get_object_or_404(CartItem, id=item_id, cart__trip=trip)
    item.delete()
    
    cart = trip.booking_cart
    
    return JsonResponse({
        'status': 'success',
        'cart_count': cart.item_count,
        'cart_total': float(cart.total_amount)
    })


@login_required
def checkout_cart(request, trip_id):
    """Checkout and make payment"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if trip.creator != request.user:
        messages.error(request, 'Only trip creator can make payments.')
        return redirect('trips:view_cart', trip_id=trip_id)
    
    cart = trip.booking_cart
    pool_wallet = trip.pool_wallet
    
    if request.method == 'POST':
        payment_method = request.POST.get('payment_method', 'wallet')
        
        total_amount = cart.total_amount
        
        if payment_method == 'wallet':
            if pool_wallet.total_balance < total_amount:
                messages.error(request, f'Insufficient balance. Need ₹{total_amount - pool_wallet.total_balance} more.')
                return redirect('trips:view_cart', trip_id=trip_id)
            
            pool_wallet.total_balance -= total_amount
            pool_wallet.save()
            
            WalletTransaction.objects.create(
                wallet=pool_wallet,
                user=request.user,
                amount=total_amount,
                transaction_type='payment',
                description=f'Payment for {cart.item_count} booking(s)',
                transaction_hash=generate_transaction_hash()
            )
        
        for item in cart.items.all():
            Booking.objects.create(
                trip=trip,
                booking_type=item.booking_type,
                title=item.title,
                amount=item.total_price,
                quantity=item.quantity,
                booking_reference=str(uuid.uuid4())[:8].upper(),
                provider=item.provider,
                booking_details=item.metadata,
                booked_by=request.user,
                status='confirmed'
            )
        
        cart.items.all().delete()
        
        messages.success(request, '✅ Payment successful! All bookings confirmed.')
        return redirect('trips:bookings_list', trip_id=trip_id)
    
    context = {
        'trip': trip,
        'cart': cart,
        'pool_wallet': pool_wallet,
    }
    return render(request, 'trips/checkout.html', context)


@login_required
def bookings_list(request, trip_id):
    """View all confirmed bookings"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    bookings = trip.bookings.all()
    
    context = {
        'trip': trip,
        'bookings': bookings,
    }
    return render(request, 'trips/bookings.html', context)


# ==================== POOL WALLET ====================

@login_required
def pool_wallet_view(request, trip_id):
    """View pool wallet details"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    pool_wallet = trip.pool_wallet if hasattr(trip, 'pool_wallet') else None
    transactions = pool_wallet.transactions.all() if pool_wallet else []
    
    member_contributions = {}
    for member in trip.members.all():
        total_contributed = pool_wallet.transactions.filter(
            user=member,
            transaction_type='contribution'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        member_contributions[member.id] = {
            'user': member,
            'amount': total_contributed
        }
    
    context = {
        'trip': trip,
        'pool_wallet': pool_wallet,
        'transactions': transactions,
        'member_contributions': member_contributions.values(),
    }
    return render(request, 'trips/pool_wallet.html', context)


@login_required
def contribute_wallet(request, trip_id):
    """Add money to pool wallet"""
    if request.method == 'POST':
        trip = get_object_or_404(Trip, id=trip_id)
        
        if not trip.members.filter(id=request.user.id).exists():
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        amount = Decimal(request.POST.get('amount', 0))
        
        if amount <= 0:
            return JsonResponse({'error': 'Invalid amount'}, status=400)
        
        pool_wallet = trip.pool_wallet
        
        pool_wallet.total_balance += amount
        pool_wallet.save()
        
        WalletTransaction.objects.create(
            wallet=pool_wallet,
            user=request.user,
            amount=amount,
            transaction_type='contribution',
            description=f'Contribution by {request.user.username}',
            transaction_hash=generate_transaction_hash()
        )
        
        return JsonResponse({
            'status': 'success',
            'new_balance': float(pool_wallet.total_balance),
            'transaction_hash': generate_transaction_hash()
        })
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


# ==================== SPLIT BILLS ====================

@login_required
def split_bill_list(request, trip_id):
    """View all split bills for a trip"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    bills = trip.split_bills.all()
    
    pending_bills = BillSplit.objects.filter(
        bill__trip=trip,
        user=request.user,
        status='pending'
    ).select_related('bill')
    
    # Calculate total amount
    total_bill_amount = sum(bill.total_amount for bill in bills)
    
    context = {
        'trip': trip,
        'bills': bills,
        'pending_bills': pending_bills,
        'is_creator': trip.creator == request.user,
        'total_bill_amount': total_bill_amount, # <--- NEW CONTEXT VARIABLE
    }
    return render(request, 'trips/split_bills.html', context)


@login_required
def create_split_bill(request, trip_id):
    """Create a new split bill"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        total_amount = Decimal(request.POST.get('total_amount', 0))
        bill_image = request.FILES.get('bill_image')
        split_equally = request.POST.get('split_equally') == 'on'
        
        if total_amount <= 0:
            messages.error(request, 'Please enter a valid amount.')
            return redirect('trips:create_split_bill', trip_id=trip_id)
        
        bill = SplitBill.objects.create(
            trip=trip,
            created_by=request.user,
            title=title,
            description=description,
            total_amount=total_amount,
            bill_image=bill_image,
            split_equally=split_equally
        )
        
        members = trip.members.all()
        
        if split_equally:
            per_person = total_amount / members.count()
            for member in members:
                BillSplit.objects.create(
                    bill=bill,
                    user=member,
                    amount=per_person,
                    status='accepted' if member == request.user else 'pending'
                )
        
        messages.success(request, f'Bill "{title}" created and sent to all members!')
        return redirect('trips:split_bill_list', trip_id=trip_id)
    
    context = {
        'trip': trip,
    }
    return render(request, 'trips/create_split_bill.html', context)


@login_required
def split_bill_detail(request, trip_id, bill_id):
    """View split bill details"""
    trip = get_object_or_404(Trip, id=trip_id)
    bill = get_object_or_404(SplitBill, id=bill_id, trip=trip)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    user_split = bill.splits.filter(user=request.user).first()
    
    context = {
        'trip': trip,
        'bill': bill,
        'user_split': user_split,
        'is_creator': bill.created_by == request.user,
    }
    return render(request, 'trips/split_bill_detail.html', context)


@login_required
def respond_to_split(request, trip_id, split_id):
    """Accept or decline a split"""
    if request.method == 'POST':
        trip = get_object_or_404(Trip, id=trip_id)
        split = get_object_or_404(BillSplit, id=split_id)
        
        if split.user != request.user:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        action = request.POST.get('action')
        
        if action == 'accept':
            split.status = 'accepted'
            split.responded_at = timezone.now()
            split.save()
            
            bill = split.bill
            if bill.splits.filter(status='pending').count() == 0:
                bill.status = 'completed'
                bill.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Split accepted! Amount will be deducted from pool wallet.'
            })
        
        elif action == 'decline':
            split.status = 'declined'
            split.responded_at = timezone.now()
            split.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Split declined.'
            })
        
        return JsonResponse({'error': 'Invalid action'}, status=400)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)


@login_required
def mark_split_paid(request, trip_id, split_id):
    """Mark a split as paid"""
    if request.method == 'POST':
        trip = get_object_or_404(Trip, id=trip_id)
        split = get_object_or_404(BillSplit, id=split_id)
        
        if split.user != request.user:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        split.status = 'paid'
        split.save()
        
        bill = split.bill
        if bill.splits.exclude(status='paid').count() == 0:
            bill.status = 'completed'
            bill.save()
        else:
            bill.status = 'partially_paid'
            bill.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Marked as paid!'
        })
    
    return JsonResponse({'error': 'Invalid request'}, status=400)