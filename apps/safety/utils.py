"""
Safety Model Utilities - Fixed for lightweight model
"""

import pickle
import joblib
from pathlib import Path
import numpy as np

# Model paths
MODEL_DIR = Path(__file__).parent.parent.parent / 'ml_models' / 'saved_models'
MODEL_PATH = MODEL_DIR / 'safety_model.pkl'
SCALER_PATH = MODEL_DIR / 'scaler.pkl'
FEATURES_PATH = MODEL_DIR / 'feature_cols.pkl'

# Cache
_MODEL_CACHE = None
_SCALER_CACHE = None
_FEATURES_CACHE = None


def load_safety_model():
    """Load safety model (cached)"""
    global _MODEL_CACHE, _SCALER_CACHE, _FEATURES_CACHE
    
    if _MODEL_CACHE is not None:
        return {
            'model': _MODEL_CACHE,
            'scaler': _SCALER_CACHE,
            'features': _FEATURES_CACHE
        }
    
    try:
        if not MODEL_PATH.exists():
            print(f"⚠️  Model not found: {MODEL_PATH}")
            return None
        
        _MODEL_CACHE = joblib.load(MODEL_PATH)
        _SCALER_CACHE = joblib.load(SCALER_PATH)
        _FEATURES_CACHE = joblib.load(FEATURES_PATH)
        
        print("✅ Safety model loaded successfully")
        
        return {
            'model': _MODEL_CACHE,
            'scaler': _SCALER_CACHE,
            'features': _FEATURES_CACHE
        }
    except Exception as e:
        print(f"⚠️ Error loading ML model: {e}")
        return None


def predict_safety_score(lat, lon, hour=12):
    """
    Predict safety score using ML model
    
    Args:
        lat: Latitude
        lon: Longitude  
        hour: Hour of day (0-23)
    
    Returns:
        float: Safety score (1-10)
    """
    model_data = load_safety_model()
    
    if model_data is None:
        # Fallback to rule-based
        return estimate_safety_fallback(lat, lon, hour)
    
    try:
        # Prepare features
        is_night = 1 if (hour >= 20 or hour <= 6) else 0
        
        # Estimate other features based on location
        crime_rate = estimate_crime_rate_by_location(lat, lon)
        street_lighting = 0.4 if is_night else 0.9
        cctv_density = 0.6
        police_response = 15.0
        foot_traffic = 0.3 if is_night else 0.7
        area_class = 1  # Urban
        
        # Create feature array
        features = np.array([[
            lat,
            lon,
            hour,
            is_night,
            crime_rate,
            street_lighting,
            cctv_density,
            police_response,
            foot_traffic,
            area_class,
        ]])
        
        # Scale and predict
        features_scaled = model_data['scaler'].transform(features)
        prediction = model_data['model'].predict(features_scaled)[0]
        
        # Clamp between 1-10
        prediction = max(1.0, min(10.0, prediction))
        
        return round(prediction, 2)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return estimate_safety_fallback(lat, lon, hour)


def estimate_crime_rate_by_location(lat, lon):
    """Estimate crime rate based on known cities"""
    
    # Known cities with crime rates
    cities = [
        (19.0760, 72.8777, 3.5),  # Mumbai
        (28.7041, 77.1025, 4.2),  # Delhi
        (12.9716, 77.5946, 2.8),  # Bangalore
        (15.2993, 74.1240, 1.8),  # Goa
    ]
    
    # Find nearest city
    min_dist = float('inf')
    nearest_crime = 3.0
    
    for city_lat, city_lon, crime in cities:
        dist = ((lat - city_lat)**2 + (lon - city_lon)**2)**0.5
        if dist < min_dist:
            min_dist = dist
            nearest_crime = crime
    
    return nearest_crime


def estimate_safety_fallback(lat, lon, hour):
    """Fallback when model not available"""
    
    is_night = hour >= 20 or hour <= 6
    base_score = 7.0
    
    # Night penalty
    if is_night:
        base_score -= 1.5
    
    # Tourist areas bonus (Goa, Kerala, Hill stations)
    if (14 <= lat <= 16 and 73 <= lon <= 75) or \
       (8 <= lat <= 12 and 75 <= lon <= 77) or \
       (lat > 30):  # Hill stations
        base_score += 1.5
    
    # High crime areas penalty (some parts)
    if (lat > 28 and lon > 77):  # Some areas
        base_score -= 0.5
    
    return max(1.0, min(10.0, base_score))


def get_safety_score(location_name, lat=None, lon=None):
    """
    Get comprehensive safety score for location
    """
    
    # If coordinates provided, use ML model
    if lat and lon:
        from datetime import datetime
        hour = datetime.now().hour
        score = predict_safety_score(lat, lon, hour)
    else:
        # Use rule-based for location name
        score = get_city_safety_score(location_name)
    
    # Format response
    if score >= 7:
        level = 'safe'
        color = 'green'
        recommendations = [
            "✅ Generally safe for tourists",
            "✅ Well-lit public areas recommended",
            "✅ Use official transportation",
        ]
    elif score >= 5:
        level = 'moderate'
        color = 'yellow'
        recommendations = [
            "⚠️ Be cautious in crowded areas",
            "⚠️ Avoid isolated areas after dark",
            "⚠️ Keep valuables secure",
        ]
    else:
        level = 'caution'
        color = 'red'
        recommendations = [
            "🚨 Exercise extreme caution",
            "🚨 Travel in groups",
            "🚨 Inform authorities of plans",
        ]
    
    return {
        'level': level,
        'score': int(score),
        'color': color,
        'recommendations': recommendations
    }


def get_city_safety_score(city_name):
    """Get safety score for city by name"""
    
    safe_cities = {
        'goa': 8.5, 'shimla': 9.0, 'manali': 9.2, 'ooty': 8.8,
        'munnar': 8.7, 'darjeeling': 8.6, 'bangalore': 8.0,
        'pune': 8.2, 'chandigarh': 8.0, 'mysore': 8.3,
    }
    
    moderate_cities = {
        'mumbai': 7.0, 'hyderabad': 7.5, 'chennai': 7.8,
        'kolkata': 6.8, 'jaipur': 7.2, 'ahmedabad': 7.4,
    }
    
    city_lower = city_name.lower()
    
    for city, score in safe_cities.items():
        if city in city_lower:
            return score
    
    for city, score in moderate_cities.items():
        if city in city_lower:
            return score
    
    return 6.5  # Default moderate


def get_all_safe_cities():
    """Get list of safe cities"""
    return [
        {'city': 'Goa', 'safety_level': 'safe'},
        {'city': 'Shimla', 'safety_level': 'safe'},
        {'city': 'Manali', 'safety_level': 'safe'},
        {'city': 'Bangalore', 'safety_level': 'safe'},
        {'city': 'Pune', 'safety_level': 'safe'},
        {'city': 'Mysore', 'safety_level': 'safe'},
        {'city': 'Ooty', 'safety_level': 'safe'},
        {'city': 'Munnar', 'safety_level': 'safe'},
    ]
