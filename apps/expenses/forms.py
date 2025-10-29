from django import forms
from .models import Expense

class ExpenseForm(forms.ModelForm):
    class Meta:
        model = Expense
        fields = ['description', 'amount', 'category', 'date', 'split_among', 'receipt', 'notes']
        widgets = {
            'description': forms.TextInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'e.g., Lunch at Beach Shack'
            }),
            'amount': forms.NumberInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'Amount in ₹'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select glass-input'
            }),
            'date': forms.DateInput(attrs={
                'class': 'form-control glass-input',
                'type': 'date'
            }),
            'split_among': forms.CheckboxSelectMultiple(attrs={
                'class': 'form-check-input'
            }),
            'receipt': forms.FileInput(attrs={
                'class': 'form-control glass-input'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control glass-input',
                'rows': 2,
                'placeholder': 'Additional notes...'
            }),
        }
