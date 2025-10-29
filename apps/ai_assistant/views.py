from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from apps.trips.models import Trip
from .services import (
    chat_based_itinerary_generation,
    ai_edit_suggestion,
    generate_packing_list,
    chat_with_ai
)
from django.utils import timezone
import json


@login_required
def generate_itinerary_view(request, trip_id):
    """Chat-based itinerary generation interface"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    context = {
        'trip': trip,
        'has_existing': bool(trip.ai_itinerary),
    }
    return render(request, 'ai_assistant/generate_itinerary.html', context)


@login_required
def chat_generate_api(request, trip_id):
    """API endpoint for chat-based generation"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    user_message = request.POST.get('message', '')
    history_json = request.POST.get('history', '[]')
    
    try:
        conversation_history = json.loads(history_json)
    except:
        conversation_history = []
    
    # Generate response
    result = chat_based_itinerary_generation(trip, user_message, conversation_history)
    
    return JsonResponse(result)


@login_required
def save_generated_itinerary(request, trip_id):
    """Save generated itinerary to trip"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    itinerary_html = request.POST.get('itinerary', '')
    
    trip.ai_itinerary = itinerary_html
    trip.itinerary_generated_at = timezone.now()
    trip.save()
    
    return JsonResponse({
        'status': 'success',
        'message': 'Itinerary saved successfully!'
    })


@login_required
def view_saved_itinerary(request, trip_id):
    """View and edit saved itinerary"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    if not trip.ai_itinerary:
        messages.info(request, 'No itinerary generated yet.')
        return redirect('ai_assistant:generate_itinerary', trip_id=trip_id)
    
    context = {
        'trip': trip,
        'itinerary_html': trip.ai_itinerary,
    }
    return render(request, 'ai_assistant/view_itinerary.html', context)


@login_required
def ai_edit_api(request, trip_id):
    """API for AI-assisted editing"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    original_text = request.POST.get('original_text', '')
    edit_request = request.POST.get('edit_request', '')
    
    suggestion = ai_edit_suggestion(original_text, edit_request)
    
    return JsonResponse({
        'status': 'success',
        'suggestion': suggestion
    })


@login_required
def save_edited_itinerary(request, trip_id):
    """Save manually edited itinerary"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    edited_content = request.POST.get('itinerary_content', '')
    
    trip.ai_itinerary = edited_content
    trip.save()
    
    return JsonResponse({
        'status': 'success',
        'message': 'Changes saved!'
    })


@login_required
def generate_packing_view(request, trip_id):
    """Generate packing list"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    if request.method == 'POST':
        packing_html = generate_packing_list(trip)
        
        context = {
            'trip': trip,
            'packing_html': packing_html,
        }
        return render(request, 'ai_assistant/packing_result.html', context)
    
    context = {'trip': trip}
    return render(request, 'ai_assistant/generate_packing.html', context)


@login_required
def chat_view(request):
    """AI chat assistant"""
    return render(request, 'ai_assistant/chat.html')


@login_required
def chat_api(request):
    """API endpoint for AI chat"""
    if request.method == 'POST':
        message = request.POST.get('message', '')
        
        if not message:
            return JsonResponse({'error': 'No message'}, status=400)
        
        response = chat_with_ai(message)
        
        return JsonResponse({
            'status': 'success',
            'response': response
        })
    
    return JsonResponse({'error': 'Invalid method'}, status=400)
