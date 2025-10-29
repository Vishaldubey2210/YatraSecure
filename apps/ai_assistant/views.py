"""
AI Assistant Views - Production Ready
Handles itinerary generation, packing lists, and chat
"""

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from apps.trips.models import Trip
import json


# Safe imports with fallback
try:
    from .services import (
        chat_based_itinerary_generation,
        ai_edit_suggestion,
        generate_packing_list,
        chat_with_ai
    )
    AI_AVAILABLE = True
except Exception as e:
    print(f"⚠️ AI services not available: {e}")
    AI_AVAILABLE = False


# Fallback functions if AI not available
def fallback_response():
    return {
        'response': 'AI service temporarily unavailable. Please try again later.',
        'itinerary_html': None,
        'is_complete': False
    }


@login_required
def generate_itinerary_view(request, trip_id):
    """Chat-based itinerary generation interface"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Check if user is a member
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'You do not have permission to access this trip.')
        return redirect('trips:trip_list')
    
    context = {
        'trip': trip,
        'has_existing': bool(trip.ai_itinerary),
        'ai_available': AI_AVAILABLE,
    }
    return render(request, 'ai_assistant/generate_itinerary.html', context)


@login_required
def chat_generate_api(request, trip_id):
    """API endpoint for chat-based itinerary generation"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    # Get parameters
    user_message = request.POST.get('message', '').strip()
    history_json = request.POST.get('history', '[]')
    
    if not user_message:
        return JsonResponse({'error': 'Message required'}, status=400)
    
    # Parse conversation history
    try:
        conversation_history = json.loads(history_json)
    except:
        conversation_history = []
    
    # Generate response
    if AI_AVAILABLE:
        try:
            result = chat_based_itinerary_generation(trip, user_message, conversation_history)
        except Exception as e:
            print(f"AI generation error: {e}")
            result = fallback_response()
    else:
        result = fallback_response()
    
    return JsonResponse(result)


@login_required
def save_generated_itinerary(request, trip_id):
    """Save AI-generated itinerary to trip"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    itinerary_html = request.POST.get('itinerary', '')
    
    if not itinerary_html:
        return JsonResponse({'error': 'No itinerary content provided'}, status=400)
    
    # Save to database
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
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'You do not have permission to access this trip.')
        return redirect('trips:trip_list')
    
    # Check if itinerary exists
    if not trip.ai_itinerary:
        messages.info(request, 'No itinerary has been generated yet.')
        return redirect('ai_assistant:generate_itinerary', trip_id=trip_id)
    
    context = {
        'trip': trip,
        'itinerary_html': trip.ai_itinerary,
        'generated_at': trip.itinerary_generated_at,
    }
    return render(request, 'ai_assistant/view_itinerary.html', context)


@login_required
def ai_edit_api(request, trip_id):
    """API for AI-assisted itinerary editing"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    original_text = request.POST.get('original_text', '')
    edit_request = request.POST.get('edit_request', '')
    
    if not original_text or not edit_request:
        return JsonResponse({'error': 'Missing parameters'}, status=400)
    
    # Generate AI suggestion
    if AI_AVAILABLE:
        try:
            suggestion = ai_edit_suggestion(original_text, edit_request)
        except Exception as e:
            print(f"AI edit error: {e}")
            suggestion = "AI editing temporarily unavailable. Please edit manually."
    else:
        suggestion = "AI editing temporarily unavailable. Please edit manually."
    
    return JsonResponse({
        'status': 'success',
        'suggestion': suggestion
    })


@login_required
def save_edited_itinerary(request, trip_id):
    """Save manually edited itinerary"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        return JsonResponse({'error': 'Access denied'}, status=403)
    
    edited_content = request.POST.get('itinerary_content', '')
    
    if not edited_content:
        return JsonResponse({'error': 'No content provided'}, status=400)
    
    # Save changes
    trip.ai_itinerary = edited_content
    trip.save()
    
    return JsonResponse({
        'status': 'success',
        'message': 'Changes saved successfully!'
    })


@login_required
def generate_packing_view(request, trip_id):
    """Generate AI-powered packing list"""
    trip = get_object_or_404(Trip, id=trip_id)
    
    # Permission check
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'You do not have permission to access this trip.')
        return redirect('trips:trip_list')
    
    if request.method == 'POST':
        # Generate packing list
        if AI_AVAILABLE:
            try:
                packing_html = generate_packing_list(trip)
            except Exception as e:
                print(f"Packing list error: {e}")
                packing_html = get_fallback_packing_list(trip)
        else:
            packing_html = get_fallback_packing_list(trip)
        
        context = {
            'trip': trip,
            'packing_html': packing_html,
        }
        return render(request, 'ai_assistant/packing_result.html', context)
    
    context = {
        'trip': trip,
        'ai_available': AI_AVAILABLE,
    }
    return render(request, 'ai_assistant/generate_packing.html', context)


def get_fallback_packing_list(trip):
    """Fallback packing list if AI unavailable"""
    return f"""
    <div class="packing-list">
        <h5>👕 Clothing & Footwear</h5>
        <ul>
            <li>Comfortable clothes for {trip.duration_days} days</li>
            <li>Walking shoes</li>
            <li>Light jacket</li>
            <li>Hat/cap</li>
        </ul>
        
        <h5>📄 Documents</h5>
        <ul>
            <li>ID proof (Aadhaar/Passport)</li>
            <li>Hotel bookings</li>
            <li>Travel tickets</li>
        </ul>
        
        <h5>📱 Electronics</h5>
        <ul>
            <li>Phone & charger</li>
            <li>Power bank</li>
            <li>Camera (optional)</li>
        </ul>
        
        <h5>💊 Health</h5>
        <ul>
            <li>Basic medicines</li>
            <li>Sunscreen</li>
            <li>Hand sanitizer</li>
        </ul>
        
        <h5>💰 Money</h5>
        <ul>
            <li>Cash</li>
            <li>Credit/Debit cards</li>
        </ul>
    </div>
    """


@login_required
def chat_view(request):
    """AI chat assistant interface"""
    context = {
        'ai_available': AI_AVAILABLE,
    }
    return render(request, 'ai_assistant/chat.html', context)


@login_required
def chat_api(request):
    """API endpoint for AI chat"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    
    message = request.POST.get('message', '').strip()
    context = request.POST.get('context', '')
    
    if not message:
        return JsonResponse({'error': 'Message required'}, status=400)
    
    # Generate AI response
    if AI_AVAILABLE:
        try:
            response_text = chat_with_ai(message, context)
        except Exception as e:
            print(f"Chat error: {e}")
            response_text = "I'm having trouble connecting right now. Please try again!"
    else:
        response_text = "AI chat is temporarily unavailable. Please check back later!"
    
    return JsonResponse({
        'status': 'success',
        'response': response_text
    })


@login_required
def itinerary(request):
    """Simple itinerary generation (non-chat)"""
    if request.method == 'POST':
        destination = request.POST.get('destination')
        days = request.POST.get('days', 3)
        budget = request.POST.get('budget', 10000)
        
        context = {
            'destination': destination,
            'days': days,
            'budget': budget,
            'itinerary': 'Itinerary will be generated here.',
        }
        return render(request, 'ai_assistant/itinerary.html', context)
    
    return render(request, 'ai_assistant/itinerary.html')


@login_required
def packing_list(request):
    """Simple packing list"""
    if request.method == 'POST':
        destination = request.POST.get('destination')
        days = request.POST.get('days', 3)
        
        context = {
            'destination': destination,
            'days': days,
            'packing_list': 'Packing list will be generated here.',
        }
        return render(request, 'ai_assistant/packing_list.html', context)
    
    return render(request, 'ai_assistant/packing_list.html')
