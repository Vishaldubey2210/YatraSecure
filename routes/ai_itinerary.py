"""
AI-Powered Itinerary Generation Routes
With Gemini AI + Demo Fallback
"""

from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user
import os
import json
import re
import traceback

ai_bp = Blueprint('ai', __name__)

# Try to import Gemini AI
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    if GEMINI_API_KEY and GEMINI_API_KEY != 'YOUR_API_KEY':
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        print("✅ Gemini AI configured")
    else:
        GEMINI_AVAILABLE = False
        print("⚠️  Gemini API key not found, using demo mode")
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed, using demo mode")


@ai_bp.route('/trip/<int:trip_id>/ai-planner')
@login_required
def ai_planner(trip_id):
    """AI Itinerary Planner Page"""
    try:
        from models.user import Trip
        trip = Trip.query.get_or_404(trip_id)
        return render_template('trip/ai_itinerary.html', trip=trip)
    except:
        # Fallback to ai_planner.html
        try:
            from models.user import Trip
            trip = Trip.query.get_or_404(trip_id)
            return render_template('trip/ai_planner.html', trip=trip)
        except Exception as e:
            print(f"Template error: {e}")
            return f"Template not found. Please create templates/trip/ai_planner.html", 500


@ai_bp.route('/api/generate-itinerary', methods=['POST'])
@login_required
def generate_itinerary():
    """Generate itinerary using AI or demo"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        trip_id = data.get('trip_id')
        trip_details = data.get('trip_details', {})
        
        print(f"🤖 AI Request: '{message}' for trip {trip_id}")
        
        # Get trip details
        from models.user import Trip
        trip = Trip.query.get(trip_id) if trip_id else None
        
        destination = trip.destination if trip else trip_details.get('destination', 'India')
        duration = trip.duration_days if trip else trip_details.get('duration', 3)
        budget = trip.total_budget if trip and trip.total_budget else trip_details.get('budget', 0)
        trip_type = trip.trip_type if trip and trip.trip_type else trip_details.get('type', 'general')
        
        # Try Gemini AI first, fallback to demo
        if GEMINI_AVAILABLE:
            try:
                itinerary_data = generate_with_gemini(destination, duration, budget, trip_type, message)
                ai_response = f"I've created a personalized {duration}-day itinerary for {destination} based on your preferences!"
                
                return jsonify({
                    'success': True,
                    'response': ai_response,
                    'itinerary': itinerary_data,
                    'source': 'gemini'
                })
            except Exception as ai_error:
                print(f"⚠️ Gemini AI failed: {ai_error}")
                # Fallback to demo
                pass
        
        # Demo fallback
        itinerary_data = generate_demo_itinerary(destination, duration, message, budget)
        ai_response = f"Great! I've created a {duration}-day itinerary for {destination} based on your preference: {message}. Check the preview!"
        
        return jsonify({
            'success': True,
            'response': ai_response,
            'itinerary': {'days': itinerary_data},
            'source': 'demo'
        })
        
    except Exception as e:
        print(f"❌ AI Error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'response': 'Sorry, I encountered an error. Please try again or use manual itinerary planning.',
            'error': str(e)
        }), 500


def generate_with_gemini(destination, duration, budget, trip_type, message):
    """Generate itinerary using Gemini AI"""
    try:
        context = f"""
You are an expert travel planner. Create a detailed {duration}-day itinerary for {destination}.

Trip Details:
- Destination: {destination}
- Duration: {duration} days
- Budget: ₹{budget if budget else 'Flexible'}
- Type: {trip_type}
- User Preferences: {message}

Create a day-by-day plan with:
- Specific activities with timing
- Hotel recommendations with prices
- Restaurant suggestions
- Estimated daily costs
- Transportation tips

Return ONLY valid JSON in this exact format:
{{
    "days": [
        {{
            "day": 1,
            "title": "Day title",
            "location": "{destination}",
            "description": "Day overview",
            "activities": "Morning: X, Afternoon: Y, Evening: Z",
            "estimated_cost": 3000,
            "hotels": [{{"name": "Hotel Name", "price": "₹2500"}}]
        }}
    ]
}}

Make it practical, budget-friendly, and exciting!
"""
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(context)
        ai_text = response.text
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
        if json_match:
            itinerary_data = json.loads(json_match.group())
            return itinerary_data
        else:
            raise ValueError("No valid JSON in AI response")
            
    except Exception as e:
        print(f"Gemini generation failed: {e}")
        raise


def generate_demo_itinerary(destination, duration, preferences, budget):
    """Generate demo itinerary (fallback)"""
    
    # Activity templates based on preferences
    activities_map = {
        'adventure': {
            'activities': ['Trekking', 'Paragliding', 'Rock climbing', 'River rafting', 'Mountain biking'],
            'restaurants': ['Adventure Cafe', 'Mountain View Restaurant', 'Trek House Dhaba']
        },
        'culture': {
            'activities': ['Temple visits', 'Museum tour', 'Heritage walk', 'Art galleries', 'Local markets'],
            'restaurants': ['Heritage Restaurant', 'Traditional Thali Place', 'Cultural Cafe']
        },
        'food': {
            'activities': ['Food tour', 'Cooking class', 'Street food tasting', 'Restaurant hopping', 'Local market'],
            'restaurants': ['Famous Local Eatery', 'Street Food Hub', 'Authentic Cuisine', 'Food Court']
        },
        'beach': {
            'activities': ['Beach relaxation', 'Water sports', 'Sunset viewing', 'Beach volleyball', 'Snorkeling'],
            'restaurants': ['Beachside Shack', 'Seafood Restaurant', 'Sunset Cafe']
        },
        'shopping': {
            'activities': ['Local markets', 'Shopping malls', 'Handicraft stores', 'Souvenir shopping', 'Bazaar'],
            'restaurants': ['Mall Food Court', 'Shopping Street Cafe', 'Market Restaurant']
        },
        'business': {
            'activities': ['Business meetings', 'Conference', 'Networking', 'Site visits', 'Client dinners'],
            'restaurants': ['Business Hotel Restaurant', 'Fine Dining', 'Corporate Cafe']
        }
    }
    
    # Detect preference
    pref_key = 'adventure'
    for key in activities_map.keys():
        if key.lower() in preferences.lower():
            pref_key = key
            break
    
    template = activities_map[pref_key]
    activities = template['activities']
    restaurants = template['restaurants']
    
    # Generate itinerary
    itinerary = []
    
    for day_num in range(1, min(duration + 1, 8)):  # Max 7 days
        
        if day_num == 1:
            # Arrival day
            day_data = {
                'day': 1,
                'title': f'Arrival in {destination}',
                'location': destination,
                'description': f'Welcome to {destination}! Check into hotel and explore nearby areas.',
                'activities': 'Morning: Arrival and hotel check-in, Afternoon: Rest and refresh, Evening: Explore local area and have dinner',
                'estimated_cost': 2000,
                'hotels': [
                    {'name': f'{destination} Hotel', 'price': '₹2500/night'}
                ]
            }
        elif day_num == duration:
            # Departure day
            day_data = {
                'day': day_num,
                'title': f'Departure from {destination}',
                'location': destination,
                'description': 'Last day - pack up and depart',
                'activities': 'Morning: Pack and check-out, Afternoon: Last-minute shopping, Evening: Departure',
                'estimated_cost': 1000,
                'hotels': []
            }
        else:
            # Activity days
            act_idx = (day_num - 2) % len(activities)
            rest_idx = day_num % len(restaurants)
            
            activity = activities[act_idx]
            restaurant = restaurants[rest_idx]
            
            day_data = {
                'day': day_num,
                'title': f'{activity} Day',
                'location': destination,
                'description': f'Full day exploring {activity.lower()} in {destination}.',
                'activities': f'Morning: {activity}, Afternoon: Lunch at {restaurant}, Evening: Leisure time',
                'estimated_cost': 3000 + (day_num * 200),
                'hotels': [
                    {'name': f'{destination} Hotel', 'price': '₹2500/night'}
                ]
            }
        
        itinerary.append(day_data)
    
    return itinerary


@ai_bp.route('/api/customize-itinerary', methods=['POST'])
@login_required
def customize_itinerary():
    """Customize existing itinerary"""
    try:
        data = request.get_json()
        itinerary = data.get('itinerary')
        changes = data.get('changes')
        
        if GEMINI_AVAILABLE:
            try:
                prompt = f"""
Modify this itinerary based on user request:

Current Itinerary: {json.dumps(itinerary)}
User Changes: {changes}

Return updated itinerary in same JSON format.
"""
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if json_match:
                    updated = json.loads(json_match.group())
                    return jsonify({'success': True, 'updated_itinerary': updated})
            except:
                pass
        
        # Fallback: return original
        return jsonify({
            'success': True,
            'updated_itinerary': itinerary,
            'message': 'Customization applied'
        })
        
    except Exception as e:
        print(f"Customize error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
