import os
import re
import json
from google import genai
from django.conf import settings


# -------------------------------
# Initialize Gemini API Client
# -------------------------------
def init_gemini():
    """Initialize Gemini API Client"""
    api_key = getattr(settings, "GEMINI_API_KEY", None)
    if api_key:
        return genai.Client(api_key=api_key)
    return None


# -------------------------------
# Chat-Based Itinerary Generation
# -------------------------------
def chat_based_itinerary_generation(trip, user_message, conversation_history):
    """
    Generate itinerary through conversational chat
    Returns AI response, generated itinerary HTML, and status flag
    """
    client = init_gemini()
    if not client:
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
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )

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
        from apps.ai_assistant.ml_service import safety_predictor
        safety_data = safety_predictor.predict_safety_score(
            latitude=28.6139,
            longitude=77.2090,
            city=trip.destination
        )

        safety_banner = f"""
        <div class="alert alert-{safety_data['color']} glass-card mb-4">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h5><i class="fas fa-shield-alt"></i> {trip.destination} Safety Score</h5>
                    <p><strong>Overall:</strong> {safety_data['safety_score']:.0f}/100 ({safety_data['risk_level']})</p>
                    <ul class="small">
                        {''.join(f'<li>{rec}</li>' for rec in safety_data.get('recommendations', []))}
                    </ul>
                </div>
                <div class="col-md-4 text-center">
                    <div class="display-4 fw-bold">{safety_data['safety_score']:.0f}</div>
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
    client = init_gemini()
    if not client:
        return "AI editing service unavailable."

    prompt = f"""
You are helping edit a travel itinerary.

Original Text:
{original_text}

User wants to: {user_edit_request}

Return ONLY the edited HTML section — same structure, concise and practical.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"


# -------------------------------
# Location Safety API
# -------------------------------
def get_location_safety_score(location_name):
    """Get ML safety score for a location"""
    try:
        from apps.ai_assistant.ml_service import safety_predictor
        return safety_predictor.predict_safety_score(
            latitude=28.6139,
            longitude=77.2090,
            city=location_name
        )
    except Exception:
        return {
            'safety_score': 75.0,
            'risk_level': 'Medium Risk',
            'color': 'warning',
            'recommendations': []
        }


# -------------------------------
# Packing List Generator
# -------------------------------
def generate_packing_list(trip):
    """Generate packing list via AI"""
    client = init_gemini()
    if not client:
        return generate_fallback_packing(trip)

    prompt = f"""
Create a packing checklist for:
Destination: {trip.destination}
Duration: {trip.duration_days} days
Trip Type: {trip.get_trip_type_display()}

Format as HTML with categories and checkboxes.
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        return response.text
    except Exception:
        return generate_fallback_packing(trip)


def generate_fallback_packing(trip):
    """Fallback packing list if AI fails"""
    return """
    <h5>👕 Clothing & Footwear</h5>
    <ul>
        <li>T-shirts (3-4)</li>
        <li>Comfortable shoes</li>
    </ul>
    """


# -------------------------------
# AI Chat Assistant
# -------------------------------
def chat_with_ai(message, context=""):
    """General-purpose AI chat assistant"""
    client = init_gemini()
    if not client:
        return "AI assistant unavailable."

    prompt = f"""
You are a travel assistant.
Context: {context}
User: {message}

Provide friendly, helpful travel advice (under 150 words).
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        return response.text
    except Exception:
        return "Error connecting to AI."
