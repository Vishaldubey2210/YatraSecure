from django import forms
from .models import Trip

class TripCreateForm(forms.ModelForm):
    class Meta:
        model = Trip
        fields = ['name', 'origin', 'destination', 'start_date', 'end_date', 'budget', 'trip_type', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'e.g., Goa Beach Adventure'
            }),
            'origin': forms.TextInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'Starting location'
            }),
            'destination': forms.TextInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'Where are you going?'
            }),
            'start_date': forms.DateInput(attrs={
                'class': 'form-control glass-input',
                'type': 'date'
            }),
            'end_date': forms.DateInput(attrs={
                'class': 'form-control glass-input',
                'type': 'date'
            }),
            'budget': forms.NumberInput(attrs={
                'class': 'form-control glass-input',
                'placeholder': 'Total budget in ₹'
            }),
            'trip_type': forms.Select(attrs={
                'class': 'form-select glass-input'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control glass-input',
                'rows': 3,
                'placeholder': 'Describe your trip...'
            }),
        }

class JoinTripForm(forms.Form):
    trip_code = forms.CharField(
        max_length=8,
        widget=forms.TextInput(attrs={
            'class': 'form-control glass-input text-center',
            'placeholder': 'Enter 8-character trip code',
            'style': 'font-size: 1.5rem; letter-spacing: 0.2rem;'
        })
    )
