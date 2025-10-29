from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import ChatMessage


@login_required
def group_chat(request, trip_id):
    from apps.trips.models import Trip
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    chat_messages = ChatMessage.objects.filter(trip=trip).select_related('user')
    
    context = {
        'trip': trip,
        'chat_messages': chat_messages,
    }
    return render(request, 'chat/group_chat.html', context)


@login_required
def send_message(request, trip_id):
    from apps.trips.models import Trip
    from apps.ai_assistant.services import chat_with_ai
    
    if request.method == 'POST':
        trip = get_object_or_404(Trip, id=trip_id)
        message_text = request.POST.get('message', '').strip()
        
        if not message_text:
            return JsonResponse({'status': 'error', 'message': 'Empty message'})
        
        # Check if it's an AI command
        if message_text.startswith('@ai '):
            ai_query = message_text[4:].strip()
            context = f"Trip: {trip.name} to {trip.destination}"
            ai_response = chat_with_ai(ai_query, context)
            
            # Save AI conversation
            ChatMessage.objects.create(
                trip=trip,
                user=request.user,
                message=message_text,
                is_ai_message=False
            )
            
            ChatMessage.objects.create(
                trip=trip,
                user=request.user,
                message=ai_response,
                is_ai_message=True
            )
            
            return JsonResponse({
                'status': 'success',
                'message': ai_response,
                'is_ai': True,
                'user': 'AI Assistant'
            })
        else:
            # Regular message
            msg = ChatMessage.objects.create(
                trip=trip,
                user=request.user,
                message=message_text
            )
            
            return JsonResponse({
                'status': 'success',
                'message': message_text,
                'is_ai': False,
                'user': request.user.username,
                'timestamp': msg.created_at.strftime('%I:%M %p')
            })
    
    return JsonResponse({'status': 'error'})
