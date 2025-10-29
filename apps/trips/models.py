from django.db import models
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
import secrets
import string
import uuid

User = get_user_model()


def generate_trip_code():
    """Generate unique 6-character trip code"""
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(secrets.choice(characters) for _ in range(6))
        if not Trip.objects.filter(trip_code=code).exists():
            return code


class Trip(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TRIP_TYPE_CHOICES = [
        ('adventure', 'Adventure'),
        ('beach', 'Beach'),
        ('cultural', 'Cultural'),
        ('wildlife', 'Wildlife'),
        ('pilgrimage', 'Pilgrimage'),
        ('business', 'Business'),
        ('family', 'Family'),
        ('luxury', 'Luxury'),
    ]
    
    name = models.CharField(max_length=255)
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    trip_type = models.CharField(max_length=50, choices=TRIP_TYPE_CHOICES, default='adventure')
    description = models.TextField(blank=True, null=True)
    trip_code = models.CharField(max_length=6, unique=True, default=generate_trip_code)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    is_public = models.BooleanField(default=False)
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_trips')
    members = models.ManyToManyField(User, through='TripMember', related_name='trips')
    
    # AI Itinerary
    ai_itinerary = models.TextField(blank=True, null=True)
    itinerary_generated_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def duration_days(self):
        """Calculate trip duration in days"""
        delta = self.end_date - self.start_date
        return delta.days + 1
    
    @property
    def member_count(self):
        """Get number of members"""
        return self.members.count()


class TripMember(models.Model):
    ROLE_CHOICES = [
        ('creator', 'Creator'),
        ('member', 'Member'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['trip', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.trip.name}"


class PoolWallet(models.Model):
    """Shared wallet for trip members"""
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='pool_wallet')
    total_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Pool Wallet - {self.trip.name}"
    
    @property
    def contribution_percentage(self):
        if self.target_amount > 0:
            return (self.total_balance / self.target_amount) * 100
        return 0


class WalletTransaction(models.Model):
    """Track contributions to pool wallet"""
    TRANSACTION_TYPES = [
        ('contribution', 'Contribution'),
        ('withdrawal', 'Withdrawal'),
        ('payment', 'Payment'),
    ]
    
    wallet = models.ForeignKey(PoolWallet, on_delete=models.CASCADE, related_name='transactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField(blank=True)
    transaction_hash = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} - {self.transaction_type}"


class BookingCart(models.Model):
    """Shopping cart for trip bookings"""
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='booking_cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart - {self.trip.name}"
    
    @property
    def total_amount(self):
        return sum(item.price * item.quantity for item in self.items.all())
    
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Items in booking cart"""
    BOOKING_TYPES = [
        ('flight', 'Flight'),
        ('train', 'Train'),
        ('cab', 'Cab'),
        ('hotel', 'Hotel'),
        ('restaurant', 'Restaurant'),
    ]
    
    cart = models.ForeignKey(BookingCart, on_delete=models.CASCADE, related_name='items')
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    booking_url = models.URLField(blank=True)
    provider = models.CharField(max_length=100)
    metadata = models.JSONField(default=dict)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.title} - ₹{self.price}"
    
    @property
    def total_price(self):
        return self.price * self.quantity


class Booking(models.Model):
    """Confirmed bookings after payment"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    booking_type = models.CharField(max_length=20, choices=CartItem.BOOKING_TYPES)
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_reference = models.CharField(max_length=100, unique=True)
    provider = models.CharField(max_length=100)
    booking_details = models.JSONField(default=dict)
    booked_by = models.ForeignKey(User, on_delete=models.CASCADE)
    booked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-booked_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"


# ✅ NEW BILL SPLITTING MODELS
class SplitBill(models.Model):
    """Bill splitting for trips"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partially_paid', 'Partially Paid'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='split_bills')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_bills')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill_image = models.ImageField(upload_to='bills/%Y/%m/', blank=True, null=True)
    split_equally = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - ₹{self.total_amount}"
    
    @property
    def per_person_amount(self):
        """Calculate amount per person"""
        member_count = self.splits.count()
        if member_count > 0:
            return self.total_amount / member_count
        return 0
    
    @property
    def accepted_count(self):
        """Count accepted splits"""
        return self.splits.filter(status='accepted').count()
    
    @property
    def pending_count(self):
        """Count pending splits"""
        return self.splits.filter(status='pending').count()


class BillSplit(models.Model):
    """Individual split for each member"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('paid', 'Paid'),
    ]
    
    bill = models.ForeignKey(SplitBill, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bill_splits')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['bill', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - ₹{self.amount} - {self.status}"
