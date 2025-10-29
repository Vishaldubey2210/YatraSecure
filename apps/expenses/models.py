from django.db import models
from django.contrib.auth import get_user_model
from apps.trips.models import Trip

User = get_user_model()

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food & Dining'),
        ('transport', 'Transportation'),
        ('accommodation', 'Accommodation'),
        ('activities', 'Activities'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]
    
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses_paid')
    split_among = models.ManyToManyField(User, related_name='shared_expenses')
    date = models.DateField()
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.description} - ₹{self.amount}"
    
    @property
    def split_amount(self):
        count = self.split_among.count()
        return self.amount / count if count > 0 else self.amount

class Settlement(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='settlements')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.from_user.username} owes {self.to_user.username} ₹{self.amount}"
