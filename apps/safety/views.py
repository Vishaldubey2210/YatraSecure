from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from apps.trips.models import Trip
from .models import SafetyReport, SOSAlert, GeoFence
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re


@login_required
def safety_map(request):
    """Safety map with real-time danger zones"""
    # Get all safety reports
    safety_reports = SafetyReport.objects.all()[:100]
    
    # Convert to list for JavaScript
    reports_data = []
    for report in safety_reports:
        if report.latitude and report.longitude:
            reports_data.append({
                'lat': float(report.latitude),
                'lon': float(report.longitude),
                'safety_score': report.safety_score,
                'location': report.location,
                'description': report.description
            })
    
    context = {
        'reports_data': reports_data,
    }
    return render(request, 'safety/safety_map.html', context)


@login_required
def get_news_alerts(request):
    """Get crime/danger news from nearby locations with web scraping"""
    lat = request.GET.get('lat')
    lon = request.GET.get('lon')
    radius = request.GET.get('radius', 50)  # Default 50km
    
    if not lat or not lon:
        return JsonResponse({'error': 'Location not provided'}, status=400)
    
    # Get location name using Nominatim
    try:
        location_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        response = requests.get(location_url, timeout=10)
        location_data = response.json()
        city = location_data.get('address', {}).get('city') or location_data.get('address', {}).get('state', 'India')
    except:
        city = 'India'
    
    # Scrape news from multiple sources
    news_alerts = []
    
    # 1. Scrape Times of India
    try:
        news_alerts.extend(scrape_toi_news(city, radius))
    except Exception as e:
        print(f"TOI scraping error: {e}")
    
    # 2. Scrape Hindustan Times
    try:
        news_alerts.extend(scrape_ht_news(city, radius))
    except Exception as e:
        print(f"HT scraping error: {e}")
    
    # 3. Use NewsAPI (if available)
    try:
        news_alerts.extend(fetch_newsapi_alerts(city, radius))
    except Exception as e:
        print(f"NewsAPI error: {e}")
    
    # Sort by severity and limit results
    news_alerts = sorted(news_alerts, key=lambda x: x.get('severity', 0), reverse=True)[:20]
    
    return JsonResponse({
        'alerts': news_alerts,
        'total': len(news_alerts),
        'location': city,
        'radius_km': radius
    })


def scrape_toi_news(city, radius):
    """Scrape Times of India for crime news"""
    alerts = []
    
    try:
        # Search for crime news
        search_terms = ['crime', 'robbery', 'theft', 'assault', 'danger']
        
        for term in search_terms[:2]:  # Limit to avoid blocking
            url = f"https://timesofindia.indiatimes.com/city/{city.lower().replace(' ', '-')}"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find news articles
                articles = soup.find_all('div', class_='col_l_6', limit=5)
                
                for article in articles:
                    try:
                        title_tag = article.find('a')
                        if title_tag:
                            title = title_tag.get_text(strip=True)
                            link = title_tag.get('href', '')
                            
                            # Check if crime-related
                            crime_keywords = ['crime', 'murder', 'robbery', 'theft', 'assault', 'attack', 'violence', 'danger']
                            if any(keyword in title.lower() for keyword in crime_keywords):
                                severity = calculate_severity(title)
                                
                                alerts.append({
                                    'title': title,
                                    'source': 'Times of India',
                                    'link': link if link.startswith('http') else f"https://timesofindia.indiatimes.com{link}",
                                    'severity': severity,
                                    'type': 'crime',
                                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                                })
                    except:
                        continue
    except Exception as e:
        print(f"TOI scraping error: {e}")
    
    return alerts


def scrape_ht_news(city, radius):
    """Scrape Hindustan Times for safety alerts"""
    alerts = []
    
    try:
        url = f"https://www.hindustantimes.com/cities/{city.lower().replace(' ', '-')}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find headlines
            headlines = soup.find_all('h3', class_='hdg3', limit=10)
            
            for headline in headlines:
                try:
                    title = headline.get_text(strip=True)
                    link_tag = headline.find_parent('a')
                    link = link_tag.get('href', '') if link_tag else ''
                    
                    # Filter crime-related
                    crime_keywords = ['crime', 'theft', 'robbery', 'murder', 'assault', 'violence', 'danger', 'alert']
                    if any(keyword in title.lower() for keyword in crime_keywords):
                        severity = calculate_severity(title)
                        
                        alerts.append({
                            'title': title,
                            'source': 'Hindustan Times',
                            'link': link if link.startswith('http') else f"https://www.hindustantimes.com{link}",
                            'severity': severity,
                            'type': 'safety',
                            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                        })
                except:
                    continue
    except Exception as e:
        print(f"HT scraping error: {e}")
    
    return alerts


def fetch_newsapi_alerts(city, radius):
    """Fetch from NewsAPI (if available)"""
    alerts = []
    
    # Mock data for demonstration (replace with actual API)
    mock_alerts = [
        {
            'title': f'Theft reported in {city} area - Police alert issued',
            'source': 'Local News',
            'link': '#',
            'severity': 70,
            'type': 'theft',
            'timestamp': (datetime.now() - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M')
        },
        {
            'title': f'Safety advisory for travelers in {city}',
            'source': 'Safety Bureau',
            'link': '#',
            'severity': 50,
            'type': 'advisory',
            'timestamp': (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M')
        }
    ]
    
    return mock_alerts


def calculate_severity(title):
    """Calculate severity based on keywords"""
    high_risk = ['murder', 'shooting', 'bomb', 'terror', 'gangrape', 'kidnap']
    medium_risk = ['robbery', 'assault', 'violence', 'stabbing', 'attack']
    low_risk = ['theft', 'pickpocket', 'scam', 'fraud']
    
    title_lower = title.lower()
    
    if any(word in title_lower for word in high_risk):
        return 90
    elif any(word in title_lower for word in medium_risk):
        return 60
    elif any(word in title_lower for word in low_risk):
        return 30
    else:
        return 40


@login_required
def report_safety(request):
    if request.method == 'POST':
        location = request.POST.get('location')
        safety_score = request.POST.get('safety_score')
        description = request.POST.get('description')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        
        SafetyReport.objects.create(
            location=location,
            latitude=latitude,
            longitude=longitude,
            safety_score=safety_score,
            description=description,
            user=request.user
        )
        
        messages.success(request, 'Safety report submitted successfully!')
        return redirect('safety:safety_map')
    
    return render(request, 'safety/report_safety.html')


@login_required
def sos_alert(request):
    if request.method == 'POST':
        latitude = request.POST.get('latitude', 0)
        longitude = request.POST.get('longitude', 0)
        
        # Create SOS alert
        sos = SOSAlert.objects.create(
            user=request.user,
            latitude=latitude,
            longitude=longitude
        )
        
        # Get emergency contact
        emergency_contact = request.user.emergency_contacts.filter(is_primary=True).first()
        
        if emergency_contact:
            whatsapp_number = emergency_contact.whatsapp.replace('+', '').replace(' ', '')
            google_maps_link = f"https://maps.google.com/?q={latitude},{longitude}"
            message = f"🚨 EMERGENCY SOS from YatraSecure!\n\n{request.user.username} needs help!\n\nLocation: {google_maps_link}\n\nPlease respond immediately!"
            whatsapp_url = f"https://wa.me/{whatsapp_number}?text={message}"
            
            return JsonResponse({
                'status': 'success',
                'whatsapp_url': whatsapp_url,
                'message': 'SOS alert created'
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'No emergency contact found. Please add one in your profile.'
            })
    
    return render(request, 'safety/sos_alert.html')
