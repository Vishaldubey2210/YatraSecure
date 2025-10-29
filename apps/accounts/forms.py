from django import forms
from django.contrib.auth import get_user_model
from .models import EmergencyContact

User = get_user_model()


class UserRegistrationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput(attrs={'class': 'form-control glass-input'}))
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput(attrs={'class': 'form-control glass-input'}))
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'email': forms.EmailInput(attrs={'class': 'form-control glass-input'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-control glass-input'}),
        }
    
    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserLoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control glass-input', 'placeholder': 'Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control glass-input', 'placeholder': 'Password'}))


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'bio', 'travel_vibe', 'home_location', 'profile_pic']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'bio': forms.Textarea(attrs={'class': 'form-control glass-input', 'rows': 4}),
            'travel_vibe': forms.Select(attrs={'class': 'form-select glass-input'}),
            'home_location': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'profile_pic': forms.FileInput(attrs={'class': 'form-control glass-input'}),
        }


class EmergencyContactForm(forms.ModelForm):
    class Meta:
        model = EmergencyContact
        fields = ['name', 'phone', 'whatsapp', 'relationship', 'is_primary']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'whatsapp': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'relationship': forms.TextInput(attrs={'class': 'form-control glass-input'}),
            'is_primary': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
