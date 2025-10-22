"""
Booking Services - Hotels, Flights, Trains
With Cart and Pool Wallet Integration
"""

from flask import Blueprint, render_template, request, jsonify, session
from flask_login import login_required, current_user
from datetime import datetime, timedelta
import random

booking_bp = Blueprint('booking', __name__)


# Demo Data Generators
def get_demo_hotels(destination, checkin, checkout):
    """Generate demo hotel listings"""
    hotel_names = [
        f"Grand {destination} Hotel", f"{destination} Palace", 
        f"Royal {destination} Resort", f"Budget Inn {destination}",
        f"Luxury {destination} Suites", f"Comfort Stay {destination}",
        f"Heritage {destination} Hotel", f"Modern {destination} Lodge"
    ]
    
    hotels = []
    for i, name in enumerate(hotel_names):
        price = random.randint(1500, 8000)
        hotels.append({
            'id': f'hotel_{i+1}',
            'name': name,
            'location': destination,
            'rating': round(random.uniform(3.5, 5.0), 1),
            'price': price,
            'amenities': random.sample(['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar'], k=4),
            'image': f'/static/images/hotel_demo_{(i%3)+1}.jpg',
            'available_rooms': random.randint(3, 20),
            'type': 'hotel'
        })
    
    return sorted(hotels, key=lambda x: x['price'])


def get_demo_flights(origin, destination, date):
    """Generate demo flight listings"""
    airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir']
    flights = []
    
    for i, airline in enumerate(airlines):
        departure = datetime.strptime(date, '%Y-%m-%d') + timedelta(hours=random.randint(6, 20))
        duration = timedelta(hours=random.randint(1, 4))
        arrival = departure + duration
        
        price = random.randint(2500, 12000)
        
        flights.append({
            'id': f'flight_{i+1}',
            'airline': airline,
            'flight_number': f'{airline[:2].upper()}{random.randint(100, 999)}',
            'origin': origin,
            'destination': destination,
            'departure': departure.strftime('%I:%M %p'),
            'arrival': arrival.strftime('%I:%M %p'),
            'duration': f"{duration.seconds//3600}h {(duration.seconds%3600)//60}m",
            'price': price,
            'class': random.choice(['Economy', 'Business']),
            'seats_available': random.randint(10, 50),
            'type': 'flight'
        })
    
    return sorted(flights, key=lambda x: x['price'])


def get_demo_trains(origin, destination, date):
    """Generate demo train listings"""
    trains = [
        {'name': 'Rajdhani Express', 'number': '12301'},
        {'name': 'Shatabdi Express', 'number': '12002'},
        {'name': 'Duronto Express', 'number': '12259'},
        {'name': 'Garib Rath', 'number': '12909'},
        {'name': 'Jan Shatabdi', 'number': '12028'}
    ]
    
    listings = []
    for i, train in enumerate(trains):
        departure = datetime.strptime(date, '%Y-%m-%d') + timedelta(hours=random.randint(5, 22))
        duration = timedelta(hours=random.randint(4, 12))
        arrival = departure + duration
        
        price = random.randint(500, 3000)
        
        listings.append({
            'id': f'train_{i+1}',
            'name': train['name'],
            'number': train['number'],
            'origin': origin,
            'destination': destination,
            'departure': departure.strftime('%I:%M %p'),
            'arrival': arrival.strftime('%I:%M %p'),
            'duration': f"{duration.seconds//3600}h {(duration.seconds%3600)//60}m",
            'price': price,
            'class': random.choice(['Sleeper', '3AC', '2AC', '1AC']),
            'seats_available': random.randint(5, 30),
            'type': 'train'
        })
    
    return sorted(listings, key=lambda x: x['price'])


@booking_bp.route('/browse')
@login_required
def browse():
    """Browse all services"""
    return render_template('booking/browse_services.html')


@booking_bp.route('/api/search-hotels')
@login_required
def search_hotels():
    """Search hotels API"""
    destination = request.args.get('destination', 'Goa')
    checkin = request.args.get('checkin')
    checkout = request.args.get('checkout')
    
    hotels = get_demo_hotels(destination, checkin, checkout)
    
    return jsonify({'success': True, 'hotels': hotels})


@booking_bp.route('/api/search-flights')
@login_required
def search_flights():
    """Search flights API"""
    origin = request.args.get('origin', 'Delhi')
    destination = request.args.get('destination', 'Goa')
    date = request.args.get('date')
    
    flights = get_demo_flights(origin, destination, date)
    
    return jsonify({'success': True, 'flights': flights})


@booking_bp.route('/api/search-trains')
@login_required
def search_trains():
    """Search trains API"""
    origin = request.args.get('origin', 'Delhi')
    destination = request.args.get('destination', 'Goa')
    date = request.args.get('date')
    
    trains = get_demo_trains(origin, destination, date)
    
    return jsonify({'success': True, 'trains': trains})


@booking_bp.route('/api/add-to-cart', methods=['POST'])
@login_required
def add_to_cart():
    """Add item to cart"""
    data = request.get_json()
    
    if 'cart' not in session:
        session['cart'] = []
    
    # Add item
    session['cart'].append(data)
    session.modified = True
    
    return jsonify({
        'success': True,
        'cart_count': len(session['cart']),
        'message': 'Added to cart!'
    })


@booking_bp.route('/cart')
@login_required
def view_cart():
    """View shopping cart"""
    cart_items = session.get('cart', [])
    total = sum(item['price'] for item in cart_items)
    
    return render_template('booking/cart.html', 
                         cart_items=cart_items, 
                         total=total)


@booking_bp.route('/api/remove-from-cart', methods=['POST'])
@login_required
def remove_from_cart():
    """Remove item from cart"""
    data = request.get_json()
    item_id = data.get('item_id')
    
    cart = session.get('cart', [])
    cart = [item for item in cart if item['id'] != item_id]
    session['cart'] = cart
    session.modified = True
    
    return jsonify({'success': True, 'cart_count': len(cart)})
