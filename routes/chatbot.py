"""
Chatbot Routes - Simple AI Assistant
"""

from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from extensions import db
from models.chatbot import ChatbotConversation, ChatMessage
import random

chatbot_bp = Blueprint('chatbot', __name__)


def get_bot_response(user_message):
    """Simple rule-based chatbot responses"""
    message = user_message.lower()
    
    # Greetings
    if any(word in message for word in ['hello', 'hi', 'hey', 'namaste']):
        responses = [
            "Hello! 👋 How can I help you plan your safe journey today?",
            "Hi there! I'm here to assist you with your travel plans.",
            "Namaste! How may I help you with your trip planning?"
        ]
        return random.choice(responses)
    
    # Safety queries
    elif any(word in message for word in ['safe', 'safety', 'secure', 'danger']):
        return "🛡️ Safety is our priority! You can:\n• Check Safety Map for real-time alerts\n• View safety scores for destinations\n• Report incidents\n• Access emergency contacts\n\nWould you like me to show you the safety map?"
    
    # Emergency
    elif any(word in message for word in ['emergency', 'sos', 'help', 'urgent']):
        return "🚨 For emergencies:\n• Press the SOS button (top right)\n• Call 112 (National Emergency)\n• Access Emergency Contacts\n\nAre you in immediate danger? Please use the SOS feature!"
    
    # Trip planning
    elif any(word in message for word in ['trip', 'plan', 'travel', 'visit']):
        return "🗺️ I can help you plan your trip!\n\n• Create a new trip\n• Add destinations to itinerary\n• Invite friends\n• Track expenses\n\nWhat would you like to do?"
    
    # Booking
    elif any(word in message for word in ['book', 'hotel', 'guide', 'service']):
        return "🏨 Looking to book services?\n\n• Hotels\n• Local Guides\n• Transport\n\nBrowse our verified service providers in the Booking section!"
    
    # Expenses
    elif any(word in message for word in ['expense', 'money', 'budget', 'cost']):
        return "💰 Expense Management:\n• Track trip expenses\n• Split bills with group\n• Set budgets\n• View spending reports\n\nGo to your trip details to manage expenses!"
    
    # Default response
    else:
        return "I'm here to help! You can ask me about:\n• Trip planning 🗺️\n• Safety information 🛡️\n• Bookings 🏨\n• Emergency help 🚨\n• Expense tracking 💰\n\nWhat would you like to know?"


@chatbot_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id')
        
        if not user_message:
            return jsonify({'success': False, 'error': 'Empty message'}), 400
        
        # Get or create conversation
        conversation = None
        if session_id:
            conversation = ChatbotConversation.query.filter_by(session_id=session_id).first()
        
        if not conversation:
            # Create new conversation
            session_id = f"chat_{current_user.user_id}_{int(datetime.now().timestamp())}"
            conversation = ChatbotConversation(
                user_id=current_user.user_id,
                session_id=session_id,
                conversation_type='support'
            )
            db.session.add(conversation)
            db.session.commit()
        
        # Save user message
        user_msg = ChatMessage(
            conversation_id=conversation.conversation_id,
            sender='user',
            message_text=user_message
        )
        db.session.add(user_msg)
        
        # Generate bot response
        bot_response = get_bot_response(user_message)
        
        # Save bot message
        bot_msg = ChatMessage(
            conversation_id=conversation.conversation_id,
            sender='bot',
            message_text=bot_response
        )
        db.session.add(bot_msg)
        
        # Update conversation last activity
        conversation.last_activity = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'response': bot_response,
            'session_id': session_id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Chat error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to process message'
        }), 500
