from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from apps.trips.models import Trip
from apps.expenses.models import Expense
from apps.gallery.models import TripPhoto
from apps.safety.models import SafetyReport
from django.db.models import Sum, Count
import requests
from math import radians, sin, cos, sqrt, atan2


def landing_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard:home')
    return render(request, 'dashboard/landing.html')


@login_required
def home_view(request):
    # Get user statistics
    user_trips = Trip.objects.filter(members=request.user)
    active_trips = user_trips.filter(status='active').count()
    
    total_expenses = Expense.objects.filter(
        trip__in=user_trips
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_photos = TripPhoto.objects.filter(
        trip__in=user_trips
    ).count()
    
    # Get recent trips
    recent_trips = user_trips.order_by('-created_at')[:5]
    
    # Calculate average safety score
    safety_reports = SafetyReport.objects.filter(user=request.user)
    avg_safety = safety_reports.aggregate(avg=Sum('safety_score'))['avg'] or 85
    
    context = {
        'active_trips': active_trips,
        'total_expenses': total_expenses,
        'total_photos': total_photos,
        'avg_safety': avg_safety,
        'recent_trips': recent_trips,
    }
    
    return render(request, 'dashboard/home.html', context)


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula (in km)"""
    R = 6371  # Earth's radius in km
    
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)


@login_required
def get_nearby_facilities(request):
    """Get nearest emergency facilities using Overpass API"""
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    
    if not lat or not lon:
        return JsonResponse({'error': 'Location not provided'}, status=400)
    
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    hospital_query = f"""
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](around:20000,{lat},{lon});
      way["amenity"="hospital"](around:20000,{lat},{lon});
      node["amenity"="clinic"](around:20000,{lat},{lon});
      way["amenity"="clinic"](around:20000,{lat},{lon});
    );
    out center;
    """
    
    police_query = f"""
    [out:json][timeout:30];
    (
      node["amenity"="police"](around:20000,{lat},{lon});
      way["amenity"="police"](around:20000,{lat},{lon});
    );
    out center;
    """
    
    bus_query = f"""
    [out:json][timeout:30];
    (
      node["amenity"="bus_station"](around:30000,{lat},{lon});
      way["amenity"="bus_station"](around:30000,{lat},{lon});
    );
    out center;
    """
    
    railway_query = f"""
    [out:json][timeout:30];
    (
      node["railway"="station"](around:50000,{lat},{lon});
      way["railway"="station"](around:50000,{lat},{lon});
    );
    out center;
    """
    
    airport_query = f"""
    [out:json][timeout:30];
    (
      node["aeroway"="aerodrome"](around:100000,{lat},{lon});
      way["aeroway"="aerodrome"](around:100000,{lat},{lon});
    );
    out center;
    """
    
    facilities = {
        'hospitals': [],
        'police_stations': [],
        'bus_stations': [],
        'railway_stations': [],
        'airports': []
    }
    
    try:
        # Fetch hospitals
        response = requests.post(overpass_url, data={'data': hospital_query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                facility_lat = element.get('lat', element.get('center', {}).get('lat'))
                facility_lon = element.get('lon', element.get('center', {}).get('lon'))
                
                if facility_lat and facility_lon:
                    distance = calculate_distance(lat, lon, facility_lat, facility_lon)
                    facilities['hospitals'].append({
                        'name': tags.get('name', 'Unnamed Hospital'),
                        'lat': facility_lat,
                        'lon': facility_lon,
                        'address': tags.get('addr:full', tags.get('addr:street', 'Address not available')),
                        'distance': distance,
                        'phone': tags.get('phone', 'N/A'),
                        'type': tags.get('amenity', 'hospital')
                    })
        
        # Fetch police stations
        response = requests.post(overpass_url, data={'data': police_query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                facility_lat = element.get('lat', element.get('center', {}).get('lat'))
                facility_lon = element.get('lon', element.get('center', {}).get('lon'))
                
                if facility_lat and facility_lon:
                    distance = calculate_distance(lat, lon, facility_lat, facility_lon)
                    facilities['police_stations'].append({
                        'name': tags.get('name', 'Police Station'),
                        'lat': facility_lat,
                        'lon': facility_lon,
                        'address': tags.get('addr:full', tags.get('addr:street', 'Address not available')),
                        'distance': distance,
                        'phone': tags.get('phone', 'N/A')
                    })
        
        # Fetch bus stations
        response = requests.post(overpass_url, data={'data': bus_query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                facility_lat = element.get('lat', element.get('center', {}).get('lat'))
                facility_lon = element.get('lon', element.get('center', {}).get('lon'))
                
                if facility_lat and facility_lon:
                    distance = calculate_distance(lat, lon, facility_lat, facility_lon)
                    facilities['bus_stations'].append({
                        'name': tags.get('name', 'Bus Station'),
                        'lat': facility_lat,
                        'lon': facility_lon,
                        'address': tags.get('addr:full', tags.get('addr:street', 'Address not available')),
                        'distance': distance
                    })
        
        # Fetch railway stations
        response = requests.post(overpass_url, data={'data': railway_query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                facility_lat = element.get('lat', element.get('center', {}).get('lat'))
                facility_lon = element.get('lon', element.get('center', {}).get('lon'))
                
                if facility_lat and facility_lon:
                    distance = calculate_distance(lat, lon, facility_lat, facility_lon)
                    facilities['railway_stations'].append({
                        'name': tags.get('name', 'Railway Station'),
                        'lat': facility_lat,
                        'lon': facility_lon,
                        'address': tags.get('addr:full', tags.get('addr:street', 'Address not available')),
                        'distance': distance
                    })
        
        # Fetch airports
        response = requests.post(overpass_url, data={'data': airport_query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                facility_lat = element.get('lat', element.get('center', {}).get('lat'))
                facility_lon = element.get('lon', element.get('center', {}).get('lon'))
                
                if facility_lat and facility_lon:
                    distance = calculate_distance(lat, lon, facility_lat, facility_lon)
                    facilities['airports'].append({
                        'name': tags.get('name', 'Airport'),
                        'lat': facility_lat,
                        'lon': facility_lon,
                        'address': tags.get('addr:full', tags.get('addr:street', 'Address not available')),
                        'distance': distance,
                        'iata': tags.get('iata', 'N/A')
                    })
        
        # Sort by distance
        facilities['hospitals'] = sorted(facilities['hospitals'], key=lambda x: x['distance'])[:3]
        facilities['police_stations'] = sorted(facilities['police_stations'], key=lambda x: x['distance'])[:3]
        facilities['bus_stations'] = sorted(facilities['bus_stations'], key=lambda x: x['distance'])[:1]
        facilities['railway_stations'] = sorted(facilities['railway_stations'], key=lambda x: x['distance'])[:1]
        facilities['airports'] = sorted(facilities['airports'], key=lambda x: x['distance'])[:1]
        
        return JsonResponse(facilities)
        
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'message': 'Failed to fetch facilities. Please try again.'
        }, status=500)


@login_required
def get_location_safety_score(request):
    """Get ML-based safety score for current location"""
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    
    if not lat or not lon:
        return JsonResponse({'error': 'Location not provided'}, status=400)
    
    try:
        from apps.ai_assistant.ml_service import safety_predictor
        
        # Predict safety score
        safety_data = safety_predictor.predict_safety_score(
            latitude=float(lat),
            longitude=float(lon)
        )
        
        return JsonResponse(safety_data)
        
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'safety_score': 75.0,
            'risk_level': 'Medium',
            'message': 'Using default score (ML model not loaded)'
        }, status=200)
