from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserRegistrationForm, UserLoginForm, ProfileForm, EmergencyContactForm
from .models import EmergencyContact

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:home')
    
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome {user.username}! Please complete your profile.')
            return redirect('accounts:create_profile')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:home')
    
    if request.method == 'POST':
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {username}!')
                return redirect('dashboard:home')
    else:
        form = UserLoginForm()
    
    return render(request, 'accounts/login.html', {'form': form})

@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('dashboard:landing')

@login_required
def create_profile(request):
    if request.method == 'POST':
        profile_form = ProfileForm(request.POST, request.FILES, instance=request.user)
        emergency_form = EmergencyContactForm(request.POST)
        
        if profile_form.is_valid() and emergency_form.is_valid():
            user = profile_form.save(commit=False)
            user.is_profile_complete = True
            user.save()
            
            emergency = emergency_form.save(commit=False)
            emergency.user = request.user
            emergency.save()
            
            messages.success(request, 'Profile completed successfully!')
            return redirect('dashboard:home')
    else:
        profile_form = ProfileForm(instance=request.user)
        emergency_form = EmergencyContactForm()
    
    context = {
        'profile_form': profile_form,
        'emergency_form': emergency_form,
    }
    return render(request, 'accounts/create_profile.html', context)

@login_required
def profile_view(request):
    emergency_contacts = EmergencyContact.objects.filter(user=request.user)
    context = {
        'user': request.user,
        'emergency_contacts': emergency_contacts,
    }
    return render(request, 'accounts/profile.html', context)
