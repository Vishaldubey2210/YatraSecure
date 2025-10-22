"""
Populate database with realistic dummy data for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db, bcrypt
from models.user import User
from models.provider import ServiceProvider
from models.safety import SafetyZone, SafetyScore, CommunityReport, Alert, ScamAlert
from models.emergency import EmergencyContact
from models.cultural import CulturalGuide
from models.circuit import TourismCircuit
from datetime import datetime, timedelta
import random

def populate_data():
    """Main function to populate all dummy data"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting to seed database...")
        
        # Clear existing data
        print("Clearing existing data...")
        db.session.query(User).delete()
        db.session.query(ServiceProvider).delete()
        db.session.query(SafetyZone).delete()
        db.session.query(SafetyScore).delete()
        db.session.query(CommunityReport).delete()
        db.session.query(Alert).delete()
        db.session.query(ScamAlert).delete()
        db.session.query(EmergencyContact).delete()
        db.session.query(CulturalGuide).delete()
        db.session.query(TourismCircuit).delete()
        db.session.commit()
        
        # Seed data
        seed_users()
        seed_service_providers()
        seed_safety_data()
        seed_emergency_contacts()
        seed_cultural_guides()
        seed_tourism_circuits()
        seed_alerts()
        seed_scam_alerts()
        
        print("✅ Database seeding completed successfully!")

def seed_users():
    """Create dummy users"""
    print("👥 Creating users...")
    
    users_data = [
        {
            'email': 'admin@yatrasecure.com',
            'full_name': 'Admin User',
            'phone': '+919876543210',
            'is_premium': True,
            'premium_expiry': datetime.now() + timedelta(days=365)
        },
        {
            'email': 'rahul.sharma@gmail.com',
            'full_name': 'Rahul Sharma',
            'phone': '+919876543211',
            'is_premium': True,
            'premium_expiry': datetime.now() + timedelta(days=30)
        },
        {
            'email': 'priya.patel@gmail.com',
            'full_name': 'Priya Patel',
            'phone': '+919876543212',
            'is_premium': False
        },
        {
            'email': 'amit.kumar@yahoo.com',
            'full_name': 'Amit Kumar',
            'phone': '+919876543213',
            'is_premium': False
        },
        {
            'email': 'sneha.reddy@gmail.com',
            'full_name': 'Sneha Reddy',
            'phone': '+919876543214',
            'is_premium': True,
            'premium_expiry': datetime.now() + timedelta(days=90)
        }
    ]
    
    for user_data in users_data:
        password_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
        user = User(
            email=user_data['email'],
            password_hash=password_hash,
            full_name=user_data['full_name'],
            phone=user_data['phone'],
            preferred_language='English',
            country='India',
            is_premium=user_data['is_premium'],
            premium_expiry=user_data.get('premium_expiry'),
            emergency_contact_name='Emergency Contact',
            emergency_contact_phone='+919999999999'
        )
        db.session.add(user)
    
    db.session.commit()
    print(f"   ✓ Created {len(users_data)} users")

def seed_service_providers():
    """Create dummy service providers"""
    print("🏨 Creating service providers...")
    
    hotels = [
        {'name': 'Taj Hotels', 'city': 'Mumbai', 'state': 'Maharashtra'},
        {'name': 'The Oberoi', 'city': 'Delhi', 'state': 'Delhi'},
        {'name': 'ITC Hotels', 'city': 'Bangalore', 'state': 'Karnataka'},
        {'name': 'Radisson Blu', 'city': 'Jaipur', 'state': 'Rajasthan'},
        {'name': 'Hyatt Regency', 'city': 'Kolkata', 'state': 'West Bengal'}
    ]
    
    guides = [
        {'name': 'Rajesh Tour Guide', 'city': 'Agra', 'state': 'Uttar Pradesh'},
        {'name': 'Sunita Travel Expert', 'city': 'Goa', 'state': 'Goa'},
        {'name': 'Vikram Heritage Tours', 'city': 'Jaipur', 'state': 'Rajasthan'},
        {'name': 'Meena Cultural Guide', 'city': 'Varanasi', 'state': 'Uttar Pradesh'}
    ]
    
    count = 0
    for hotel in hotels:
        password_hash = bcrypt.generate_password_hash('provider123').decode('utf-8')
        provider = ServiceProvider(
            business_name=hotel['name'],
            provider_type='hotel',
            email=f"{hotel['name'].lower().replace(' ', '')}@example.com",
            password_hash=password_hash,
            phone=f"+9198765432{20 + count}",
            city=hotel['city'],
            state=hotel['state'],
            description=f"Premium hotel services in {hotel['city']}",
            is_verified=True,
            rating=random.uniform(4.0, 5.0),
            total_reviews=random.randint(50, 500)
        )
        db.session.add(provider)
        count += 1
    
    for guide in guides:
        password_hash = bcrypt.generate_password_hash('provider123').decode('utf-8')
        provider = ServiceProvider(
            business_name=guide['name'],
            provider_type='guide',
            email=f"{guide['name'].lower().replace(' ', '')}@example.com",
            password_hash=password_hash,
            phone=f"+9198765432{30 + count}",
            city=guide['city'],
            state=guide['state'],
            description=f"Experienced local guide in {guide['city']}",
            is_verified=True,
            rating=random.uniform(4.2, 4.9),
            total_reviews=random.randint(20, 200)
        )
        db.session.add(provider)
        count += 1
    
    db.session.commit()
    print(f"   ✓ Created {count} service providers")

def seed_safety_data():
    """Create safety zones and scores"""
    print("🛡️ Creating safety data...")
    
    # Safety Scores for major cities
    cities_data = [
        {'name': 'Mumbai', 'state': 'Maharashtra', 'score': 72, 'crime': 65, 'health': 80, 'infra': 85},
        {'name': 'Delhi', 'state': 'Delhi', 'score': 58, 'crime': 45, 'health': 70, 'infra': 80},
        {'name': 'Bangalore', 'state': 'Karnataka', 'score': 78, 'crime': 75, 'health': 85, 'infra': 90},
        {'name': 'Kolkata', 'state': 'West Bengal', 'score': 65, 'crime': 60, 'health': 72, 'infra': 70},
        {'name': 'Chennai', 'state': 'Tamil Nadu', 'score': 75, 'crime': 70, 'health': 82, 'infra': 80},
        {'name': 'Jaipur', 'state': 'Rajasthan', 'score': 70, 'crime': 68, 'health': 75, 'infra': 72},
        {'name': 'Goa', 'state': 'Goa', 'score': 80, 'crime': 78, 'health': 85, 'infra': 82},
        {'name': 'Agra', 'state': 'Uttar Pradesh', 'score': 62, 'crime': 55, 'health': 68, 'infra': 65},
        {'name': 'Varanasi', 'state': 'Uttar Pradesh', 'score': 60, 'crime': 58, 'health': 65, 'infra': 62},
        {'name': 'Shimla', 'state': 'Himachal Pradesh', 'score': 82, 'crime': 80, 'health': 88, 'infra': 78}
    ]
    
    for city in cities_data:
        score = SafetyScore(
            location_name=city['name'],
            location_type='city',
            overall_score=city['score'],
            crime_score=city['crime'],
            health_score=city['health'],
            infrastructure_score=city['infra'],
            tourist_friendly_score=random.randint(70, 90)
        )
        db.session.add(score)
    
    # State-level scores
    states_data = [
        {'name': 'Kerala', 'score': 85},
        {'name': 'Gujarat', 'score': 76},
        {'name': 'Maharashtra', 'score': 72},
        {'name': 'Tamil Nadu', 'score': 74},
        {'name': 'Rajasthan', 'score': 70},
        {'name': 'Karnataka', 'score': 78},
        {'name': 'Himachal Pradesh', 'score': 82},
        {'name': 'Uttarakhand', 'score': 79}
    ]
    
    for state in states_data:
        score = SafetyScore(
            location_name=state['name'],
            location_type='state',
            overall_score=state['score'],
            crime_score=state['score'] - 5,
            health_score=state['score'] + 5,
            infrastructure_score=state['score'],
            tourist_friendly_score=state['score'] + 3
        )
        db.session.add(score)
    
    # Danger Zones
    danger_zones = [
        {'city': 'Delhi', 'state': 'Delhi', 'lat': 28.6139, 'lon': 77.2090, 'type': 'crime', 'risk': 'high', 'desc': 'High theft reports in tourist areas'},
        {'city': 'Mumbai', 'state': 'Maharashtra', 'lat': 18.9750, 'lon': 72.8258, 'type': 'crime', 'risk': 'medium', 'desc': 'Crowded areas - pickpocketing risk'},
        {'city': 'Agra', 'state': 'Uttar Pradesh', 'lat': 27.1767, 'lon': 78.0081, 'type': 'crime', 'risk': 'high', 'desc': 'Tourist scams near Taj Mahal'},
        {'city': 'Manali', 'state': 'Himachal Pradesh', 'lat': 32.2396, 'lon': 77.1887, 'type': 'natural_disaster', 'risk': 'medium', 'desc': 'Landslide prone area during monsoon'},
        {'city': 'Jim Corbett', 'state': 'Uttarakhand', 'lat': 29.5316, 'lon': 78.7709, 'type': 'animal_attack', 'risk': 'medium', 'desc': 'Wild elephant movement zones'},
        {'city': 'Sundarbans', 'state': 'West Bengal', 'lat': 21.9497, 'lon': 88.8878, 'type': 'animal_attack', 'risk': 'high', 'desc': 'Tiger attack zones'},
        {'city': 'Kashmir Valley', 'state': 'Jammu & Kashmir', 'lat': 34.0837, 'lon': 74.7973, 'type': 'restricted', 'risk': 'critical', 'desc': 'Security concerns - permit required'},
        {'city': 'Leh-Ladakh', 'state': 'Ladakh', 'lat': 34.1526, 'lon': 77.5771, 'type': 'health_hazard', 'risk': 'medium', 'desc': 'High altitude sickness risk'}
    ]
    
    for zone in danger_zones:
        danger = SafetyZone(
            city=zone['city'],
            state=zone['state'],
            latitude=zone['lat'],
            longitude=zone['lon'],
            zone_type=zone['type'],
            risk_level=zone['risk'],
            description=zone['desc']
        )
        db.session.add(danger)
    
    db.session.commit()
    print(f"   ✓ Created {len(cities_data) + len(states_data)} safety scores and {len(danger_zones)} danger zones")

def seed_emergency_contacts():
    """Create emergency contact database"""
    print("🚨 Creating emergency contacts...")
    
    contacts = [
        # Delhi
        {'state': 'Delhi', 'district': 'New Delhi', 'type': 'tourist_helpline', 'name': 'Delhi Tourism Helpline', 'phone': '1363', 'lat': 28.6139, 'lon': 77.2090},
        {'state': 'Delhi', 'district': 'New Delhi', 'type': 'police', 'name': 'Connaught Place Police Station', 'phone': '011-23742840', 'lat': 28.6304, 'lon': 77.2177},
        {'state': 'Delhi', 'district': 'New Delhi', 'type': 'hospital', 'name': 'AIIMS Emergency', 'phone': '011-26588500', 'lat': 28.5672, 'lon': 77.2100},
        
        # Mumbai
        {'state': 'Maharashtra', 'district': 'Mumbai', 'type': 'tourist_helpline', 'name': 'Mumbai Tourism Police', 'phone': '022-22633333', 'lat': 18.9388, 'lon': 72.8354},
        {'state': 'Maharashtra', 'district': 'Mumbai', 'type': 'hospital', 'name': 'Bombay Hospital', 'phone': '022-22067676', 'lat': 18.9586, 'lon': 72.8142},
        
        # Bangalore
        {'state': 'Karnataka', 'district': 'Bangalore', 'type': 'tourist_helpline', 'name': 'Karnataka Tourism', 'phone': '080-22352828', 'lat': 12.9716, 'lon': 77.5946},
        {'state': 'Karnataka', 'district': 'Bangalore', 'type': 'hospital', 'name': 'Manipal Hospital', 'phone': '080-25023344', 'lat': 12.9899, 'lon': 77.5995},
        
        # Goa
        {'state': 'Goa', 'district': 'North Goa', 'type': 'tourist_helpline', 'name': 'Goa Tourism Helpline', 'phone': '0832-2438750', 'lat': 15.4909, 'lon': 73.8278},
        {'state': 'Goa', 'district': 'Panaji', 'type': 'hospital', 'name': 'Goa Medical College', 'phone': '0832-2458700', 'lat': 15.4631, 'lon': 73.8285},
        
        # Jaipur
        {'state': 'Rajasthan', 'district': 'Jaipur', 'type': 'tourist_helpline', 'name': 'Rajasthan Tourism', 'phone': '0141-5110598', 'lat': 26.9124, 'lon': 75.7873},
        {'state': 'Rajasthan', 'district': 'Jaipur', 'type': 'police', 'name': 'Tourist Police Jaipur', 'phone': '0141-2743520', 'lat': 26.9196, 'lon': 75.7878}
    ]
    
    for contact in contacts:
        ec = EmergencyContact(
            state=contact['state'],
            district=contact.get('district'),
            service_type=contact['type'],
            name=contact['name'],
            phone=contact['phone'],
            latitude=contact.get('lat'),
            longitude=contact.get('lon')
        )
        db.session.add(ec)
    
    db.session.commit()
    print(f"   ✓ Created {len(contacts)} emergency contacts")

def seed_cultural_guides():
    """Create cultural etiquette guides"""
    print("📚 Creating cultural guides...")
    
    guides = [
        {
            'state': 'Rajasthan',
            'title': 'Dress Code in Rajasthan Temples',
            'content': 'When visiting temples in Rajasthan, ensure modest clothing covering shoulders and knees. Remove shoes before entering. Photography may be restricted in certain areas.',
            'category': 'etiquette'
        },
        {
            'state': 'Kerala',
            'title': 'Kerala Festival Etiquette',
            'content': 'During Onam and other festivals, respect local customs. Ask permission before photographing religious ceremonies. White attire is traditional for temple visits.',
            'category': 'festivals'
        },
        {
            'state': 'Tamil Nadu',
            'title': 'Temple Dress Code',
            'content': 'Men should wear dhoti or pants with shirt. Women should wear sarees or salwar kameez. Western clothing is generally not allowed in major temples.',
            'category': 'dress_code'
        },
        {
            'state': 'Goa',
            'title': 'Beach and Church Etiquette',
            'content': 'While Goa is liberal, respect church dress codes. Cover up when entering religious places. Avoid loud music near residential areas after 10 PM.',
            'category': 'etiquette'
        },
        {
            'state': 'Himachal Pradesh',
            'title': 'Mountain Monastery Customs',
            'content': 'Walk clockwise around Buddhist monasteries. Remove shoes before entering. Photography inside prayer halls often requires permission.',
            'category': 'etiquette'
        }
    ]
    
    for guide in guides:
        cg = CulturalGuide(
            state=guide['state'],
            title=guide['title'],
            content=guide['content'],
            category=guide['category']
        )
        db.session.add(cg)
    
    db.session.commit()
    print(f"   ✓ Created {len(guides)} cultural guides")

def seed_tourism_circuits():
    """Create tourism circuit information"""
    print("🗺️ Creating tourism circuits...")
    
    circuits = [
        {
            'name': 'Buddhist Circuit',
            'states': 'Bihar, Uttar Pradesh',
            'description': 'Follow the path of Buddha covering Bodh Gaya, Sarnath, Kushinagar, and Lumbini',
            'destinations': 'Bodh Gaya, Sarnath, Kushinagar, Rajgir, Nalanda',
            'season': 'October to March',
            'days': 7,
            'difficulty': 'Easy'
        },
        {
            'name': 'Himalayan Circuit',
            'states': 'Himachal Pradesh, Uttarakhand, Jammu & Kashmir',
            'description': 'Experience the majestic Himalayas covering hill stations and spiritual destinations',
            'destinations': 'Shimla, Manali, Rishikesh, Haridwar, Leh-Ladakh',
            'season': 'May to September',
            'days': 14,
            'difficulty': 'Moderate'
        },
        {
            'name': 'Coastal Circuit',
            'states': 'Goa, Karnataka, Kerala',
            'description': 'Explore the beautiful western coastline with beaches, backwaters and culture',
            'destinations': 'Goa Beaches, Gokarna, Kochi, Alleppey, Kovalam',
            'season': 'November to February',
            'days': 10,
            'difficulty': 'Easy'
        },
        {
            'name': 'Heritage Circuit - Rajasthan',
            'states': 'Rajasthan',
            'description': 'Royal palaces, forts and desert experience',
            'destinations': 'Jaipur, Jodhpur, Udaipur, Jaisalmer, Bikaner',
            'season': 'October to March',
            'days': 12,
            'difficulty': 'Easy'
        },
        {
            'name': 'Tribal Circuit - Northeast',
            'states': 'Assam, Meghalaya, Arunachal Pradesh, Nagaland',
            'description': 'Experience diverse tribal cultures and pristine nature',
            'destinations': 'Guwahati, Shillong, Cherrapunji, Tawang, Kohima',
            'season': 'October to April',
            'days': 14,
            'difficulty': 'Challenging'
        }
    ]
    
    for circuit in circuits:
        tc = TourismCircuit(
            circuit_name=circuit['name'],
            states_covered=circuit['states'],
            description=circuit['description'],
            key_destinations=circuit['destinations'],
            best_season=circuit['season'],
            estimated_days=circuit['days'],
            difficulty_level=circuit['difficulty']
        )
        db.session.add(tc)
    
    db.session.commit()
    print(f"   ✓ Created {len(circuits)} tourism circuits")

def seed_alerts():
    """Create sample alerts"""
    print("⚠️ Creating alerts...")
    
    alerts = [
        {
            'type': 'weather',
            'location': 'Shimla, Himachal Pradesh',
            'state': 'Himachal Pradesh',
            'severity': 'warning',
            'title': 'Heavy Snowfall Expected',
            'description': 'Heavy snowfall predicted for next 48 hours. Roads may be blocked.',
            'source': 'government'
        },
        {
            'type': 'protest',
            'location': 'Delhi',
            'state': 'Delhi',
            'severity': 'info',
            'title': 'Traffic Diversion at India Gate',
            'description': 'Peaceful protest planned. Traffic may be affected between 2-6 PM.',
            'source': 'twitter'
        },
        {
            'type': 'health',
            'location': 'Kerala',
            'state': 'Kerala',
            'severity': 'warning',
            'title': 'Dengue Cases Rising',
            'description': 'Increased dengue cases reported. Take mosquito prevention measures.',
            'source': 'government'
        }
    ]
    
    for alert in alerts:
        a = Alert(
            alert_type=alert['type'],
            location=alert['location'],
            state=alert['state'],
            severity=alert['severity'],
            title=alert['title'],
            description=alert['description'],
            source=alert['source'],
            valid_until=datetime.now() + timedelta(days=3)
        )
        db.session.add(a)
    
    db.session.commit()
    print(f"   ✓ Created {len(alerts)} alerts")

def seed_scam_alerts():
    """Create scam alert database"""
    print("🚫 Creating scam alerts...")
    
    scams = [
        {
            'city': 'Delhi',
            'type': 'Fake Tour Guide',
            'description': 'Unauthorized guides near major monuments offering discounted tours but taking to overpriced shops.',
            'prevention': 'Only hire government-certified guides. Check ID cards. Avoid unsolicited offers.'
        },
        {
            'city': 'Agra',
            'type': 'Taj Mahal Ticket Scam',
            'description': 'Fake ticket counters selling expensive tickets. Real tickets cost ₹250 for foreigners.',
            'prevention': 'Buy tickets only from official ASI counters or online at asi.nic.in'
        },
        {
            'city': 'Mumbai',
            'type': 'Taxi Meter Tampering',
            'description': 'Rigged meters showing inflated fares, especially from airport.',
            'prevention': 'Use official prepaid taxi counters or app-based services like Uber/Ola'
        },
        {
            'city': 'Jaipur',
            'type': 'Gem Scam',
            'description': 'Shops claiming to offer investment opportunities in gems that can be resold at profit.',
            'prevention': 'Never invest in gems from tourist shops. These are common scams targeting foreigners.'
        },
        {
            'city': 'Goa',
            'type': 'Water Sports Overcharging',
            'description': 'No fixed prices displayed, charging exorbitant amounts after activity.',
            'prevention': 'Always confirm and negotiate price before starting. Get written receipts.'
        },
        {
            'city': 'Varanasi',
            'type': 'Boat Ride Overpricing',
            'description': 'Boat operators charging 10x normal rates to tourists.',
            'prevention': 'Fixed rates: ₹150-300 per hour. Negotiate firmly or use official boat operators.'
        }
    ]
    
    for scam in scams:
        sa = ScamAlert(
            city=scam['city'],
            scam_type=scam['type'],
            description=scam['description'],
            prevention_tips=scam['prevention'],
            reported_count=random.randint(10, 100)
        )
        db.session.add(sa)
    
    db.session.commit()
    print(f"   ✓ Created {len(scams)} scam alerts")

if __name__ == '__main__':
    populate_data()
