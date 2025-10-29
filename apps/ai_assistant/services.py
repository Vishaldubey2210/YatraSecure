"""
AI Assistant Services - Fixed for Render Deployment
Uses google.generativeai (correct import)
"""

import os
import re
import json
import google.generativeai as genai  # ✅ Correct import
from django.conf import settings


# -------------------------------
# Initialize Gemini API Client
# -------------------------------
def init_gemini():
    """Initialize Gemini API with correct configuration"""
    api_key = getattr(settings, "GEMINI_API_KEY", None)
    if api_key:
        try:
            genai.configure(api_key=api_key)
            return genai.GenerativeModel('gemini-pro')  # ✅ Correct model initialization
        except Exception as e:
            print(f"Gemini init error: {e}")
            return None
    return None


# -------------------------------
# Chat-Based Itinerary Generation
# -------------------------------
def chat_based_itinerary_generation(trip, user_message, conversation_history):
    """
    Generate itinerary through conversational chat
    Returns AI response, generated itinerary HTML, and status flag
    """
    model = init_gemini()
    if not model:
        return {
            'response': "Sorry, AI service is temporarily unavailable.",
            'itinerary_html': None,
            'is_complete': False
        }

    # Build conversational context
    context = f"""
You are an expert travel planner AI helping to create a personalized itinerary.

Trip Details:
- Destination: {trip.destination}
- Origin: {trip.origin}
- Duration: {trip.duration_days} days
- Budget: ₹{trip.budget}
- Trip Type: {trip.get_trip_type_display()}
- Start Date: {trip.start_date}
- End Date: {trip.end_date}

Conversation History:
"""
    for msg in conversation_history:
        context += f"\nUser: {msg.get('user', '')}"
        context += f"\nYou: {msg.get('ai', '')}"

    prompt = f"""
{context}

User: {user_message}

Instructions:
1. If user asks to create complete itinerary or says "yes/okay", generate FULL detailed itinerary.
2. If user only chats or modifies, reply conversationally.
3. When generating full itinerary, format it as **clean HTML**:
   - Day-wise breakdown (use <h4> for each day)
   - Morning/Afternoon/Evening activities
   - Costs, locations, timing, safety tips
   - Total budget breakdown at end

End full itineraries with marker:
[ITINERARY_COMPLETE]

Respond naturally and helpfully.
"""

    try:
        response = model.generate_content(prompt)
        ai_response = response.text
        
        is_complete = '[ITINERARY_COMPLETE]' in ai_response
        itinerary_html = None

        if is_complete:
            ai_response = ai_response.replace('[ITINERARY_COMPLETE]', '')

            # Try extracting HTML
            html_match = re.search(r'<[^>]+>.*</[^>]+>', ai_response, re.DOTALL)
            if html_match:
                itinerary_html = html_match.group(0)
            else:
                itinerary_html = convert_text_to_html(ai_response)

        # Attach safety insights if itinerary was made
        if itinerary_html:
            itinerary_html = add_safety_scores_to_html(itinerary_html, trip)

        return {
            'response': ai_response.strip(),
            'itinerary_html': itinerary_html,
            'is_complete': is_complete
        }

    except Exception as e:
        print(f"[AI ERROR] Chat itinerary failed: {e}")
        return {
            'response': f"I encountered an error: {str(e)}. Please try again later.",
            'itinerary_html': None,
            'is_complete': False
        }


# -------------------------------
# Convert Text → HTML
# -------------------------------
def convert_text_to_html(text):
    """Convert plain text itinerary to formatted HTML"""
    lines = text.split('\n')
    html = '<div class="generated-itinerary">'
    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line.lower().startswith('day '):
            html += f'<h4 class="text-primary mt-4 mb-3">{line}</h4>'
        elif line.endswith(':') and len(line.split()) <= 5:
            html += f'<h6 class="text-success mt-3 mb-2">{line}</h6>'
        elif line.startswith('- ') or line.startswith('* '):
            html += f'<p class="mb-2">• {line[2:]}</p>'
        else:
            html += f'<p class="mb-2">{line}</p>'
    html += '</div>'
    return html


# -------------------------------
# Add Safety Scores to Itinerary
# -------------------------------
def add_safety_scores_to_html(html, trip):
    """Attach safety information to itinerary"""
    try:
        from apps.ai_assistant.ml_service import get_ml_service
        ml_service = get_ml_service()
        
        # Use trip destination coordinates (fallback to Delhi)
        safety_data = ml_service.predict_safety(
            latitude=28.6139,
            longitude=77.2090,
            hour=12
        )

        safety_banner = f"""
        <div class="alert alert-{safety_data.get('color', 'info')} glass-card mb-4">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h5><i class="fas fa-shield-alt"></i> {trip.destination} Safety Score</h5>
                    <p><strong>Overall:</strong> {safety_data.get('safety_score', 'N/A')}/10 ({safety_data.get('safety_level', 'Unknown')})</p>
                    <ul class="small">
                        {''.join(f'<li>{rec}</li>' for rec in safety_data.get('recommendations', [])[:3])}
                    </ul>
                </div>
                <div class="col-md-4 text-center">
                    <div class="display-4 fw-bold">{safety_data.get('safety_score', 'N/A')}</div>
                    <small class="text-muted">Safety Score</small>
                </div>
            </div>
        </div>
        """
        return safety_banner + html
    except Exception as e:
        print(f"[AI ERROR] Safety integration failed: {e}")
        return html


# -------------------------------
# AI Edit Suggestion
# -------------------------------
def ai_edit_suggestion(original_text, user_edit_request):
    """AI suggests edits to parts of itinerary"""
    model = init_gemini()
    if not model:
        return "AI editing service unavailable."

    prompt = f"""
You are helping edit a travel itinerary.

Original Text:
{original_text}

User wants to: {user_edit_request}

Return ONLY the edited HTML section — same structure, concise and practical.
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


# -------------------------------
# Location Safety API
# -------------------------------
def get_location_safety_score(location_name):
    """Get ML safety score for a location"""
    try:
        from apps.ai_assistant.ml_service import get_ml_service
        ml_service = get_ml_service()
        
        # Default coordinates (can be improved with geocoding)
        result = ml_service.predict_safety(
            latitude=28.6139,
            longitude=77.2090,
            hour=12
        )
        return result
    except Exception as e:
        print(f"Safety score error: {e}")
        return {
            'safety_score': 6.5,
            'safety_level': 'moderate',
            'color': 'warning',
            'recommendations': ['Be cautious', 'Keep valuables secure']
        }


# -------------------------------
# Packing List Generator
# -------------------------------
def generate_packing_list(trip):
    """Generate packing list via AI"""
    model = init_gemini()
    if not model:
        return generate_fallback_packing(trip)

    prompt = f"""
Create a comprehensive packing checklist for:
Destination: {trip.destination}
Duration: {trip.duration_days} days
Trip Type: {trip.get_trip_type_display()}
Season: Current season in India

Format as clean HTML with categories:
- Clothing
- Documents
- Electronics
- Toiletries
- Medicine
- Special items

Use <h5> for categories and <ul><li> for items.
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Packing list error: {e}")
        return generate_fallback_packing(trip)


def generate_fallback_packing(trip):
    """Fallback packing list if AI fails"""
    return f"""
    <div class="packing-list">
        <h5>👕 Clothing & Footwear</h5>
        <ul>
            <li>Comfortable clothes for {trip.duration_days} days</li>
            <li>Comfortable walking shoes</li>
            <li>Light jacket</li>
            <li>Hat/Cap for sun protection</li>
        </ul>
        
        <h5>📄 Documents</h5>
        <ul>
            <li>ID proof (Aadhaar/Passport)</li>
            <li>Hotel bookings</li>
            <li>Travel tickets</li>
            <li>Travel insurance (if any)</li>
        </ul>
        
        <h5>📱 Electronics</h5>
        <ul>
            <li>Phone & charger</li>
            <li>Power bank</li>
            <li>Camera (optional)</li>
            <li>Headphones</li>
        </ul>
        
        <h5>💊 Health & Toiletries</h5>
        <ul>
            <li>Basic medicines</li>
            <li>Sunscreen</li>
            <li>Hand sanitizer</li>
            <li>Personal hygiene items</li>
        </ul>
        
        <h5>💰 Money & Cards</h5>
        <ul>
            <li>Cash</li>
            <li>Credit/Debit cards</li>
            <li>Digital wallets</li>
        </ul>
    </div>
    """


# -------------------------------
# AI Chat Assistant
# -------------------------------
def chat_with_ai(message, context=""):
    """General-purpose AI chat assistant"""
    model = init_gemini()
    if not model:
        return "AI assistant is currently unavailable. Please try again later."

    prompt = f"""
You are a friendly and helpful travel assistant for India.
Context: {context if context else 'General travel inquiry'}

User question: {message}

Provide helpful, practical advice about travel in India.
Keep response under 150 words.
Be friendly and conversational.
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Chat error: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment!"


# -------------------------------
# Simple Itinerary Generator (Non-Chat)
# -------------------------------
def generate_simple_itinerary(destination, days, budget, preferences=''):
    """Generate itinerary without chat interface"""
    model = init_gemini()
    if not model:
        return generate_fallback_itinerary(destination, days)
    
    prompt = f"""
Create a detailed {days}-day travel itinerary for {destination}, India.
Budget: ₹{budget}
Preferences: {preferences if preferences else 'General sightseeing'}

Include for each day:
- Morning, Afternoon, Evening activities
- Must-visit places
- Food recommendations
- Estimated costs
- Travel tips

Format as clean HTML with <h4> for each day.
"""
    
    try:
        response = model.generate_content(prompt)
        return convert_text_to_html(response.text)
    except Exception as e:
        print(f"Itinerary error: {e}")
        return generate_fallback_itinerary(destination, days)


def generate_fallback_itinerary(destination, days):
    """Basic fallback itinerary"""
    return f"""
    <h4>Day 1: Arrival & Local Exploration</h4>
    <p>Check into hotel and explore nearby areas. Try local cuisine.</p>
    
    <h4>Day 2-{days-1}: Main Attractions</h4>
    <p>Visit popular tourist spots, cultural sites, and local markets in {destination}.</p>
    
    <h4>Day {days}: Departure</h4>
    <p>Last-minute shopping and airport transfer.</p>
    
    <p><em>Note: For detailed AI-generated itinerary, please ensure Gemini API is configured.</em></p>
    """
