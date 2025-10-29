from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from apps.trips.models import Trip
from .models import Expense, Settlement
from .forms import ExpenseForm
from django.db.models import Sum

@login_required
def add_expense(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'You are not a member of this trip.')
        return redirect('trips:trip_list')
    
    if request.method == 'POST':
        form = ExpenseForm(request.POST, request.FILES)
        if form.is_valid():
            expense = form.save(commit=False)
            expense.trip = trip
            expense.paid_by = request.user
            expense.save()
            form.save_m2m()  # Save many-to-many relationships
            
            messages.success(request, 'Expense added successfully!')
            return redirect('trips:trip_detail', trip_id=trip.id)
    else:
        form = ExpenseForm()
        form.fields['split_among'].queryset = trip.members.all()
    
    context = {
        'form': form,
        'trip': trip,
    }
    return render(request, 'expenses/add_expense.html', context)

@login_required
def expense_list(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    expenses = Expense.objects.filter(trip=trip).select_related('paid_by')
    
    # Calculate totals
    total_spent = expenses.aggregate(total=Sum('amount'))['total'] or 0
    user_paid = expenses.filter(paid_by=request.user).aggregate(total=Sum('amount'))['total'] or 0
    
    context = {
        'trip': trip,
        'expenses': expenses,
        'total_spent': total_spent,
        'user_paid': user_paid,
    }
    return render(request, 'expenses/expense_list.html', context)

@login_required
def settlement_view(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    settlements = Settlement.objects.filter(trip=trip, is_settled=False)
    
    context = {
        'trip': trip,
        'settlements': settlements,
    }
    return render(request, 'expenses/settlement.html', context)
