"""
AI Assistant ML Service - Updated for lightweight model
"""

import joblib
import os
import numpy as np
from pathlib import Path


class SafetyMLService:
    """ML service for safety predictions"""
    
    def __init__(self):
        """Initialize ML service"""
        self.model = None
        self.scaler = None
        self.feature_cols = None
        self.model_loaded = False
        
        # Load model on init
        self.load_model()
    
    def load_model(self):
        """Load lightweight safety model"""
        try:
            base_path = Path(__file__).parent.parent.parent / 'ml_models' / 'saved_models'
            
            model_path = base_path / 'safety_model.pkl'
            scaler_path = base_path / 'scaler.pkl'
            features_path = base_path / 'feature_cols.pkl'
            
            if not model_path.exists():
                print(f"⚠️ Model not found at: {model_path}")
                return False
            
            # Load model components
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.feature_cols = joblib.load(features_path)
            
            self.model_loaded = True
            print("✅ ML model loaded successfully")
            return True
            
        except Exception as e:
            print(f"⚠️ Error loading ML model: {e}")
            self.model_loaded = False
            return False
    
    def predict_safety(self, latitude, longitude, hour=12, **kwargs):
        """
        Predict safety score for location
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            hour: Hour of day (0-23)
            **kwargs: Additional optional parameters
        
        Returns:
            dict: Safety prediction with score and level
        """
        
        if not self.model_loaded:
            return self._fallback_prediction(latitude, longitude, hour)
        
        try:
            # Prepare features for lightweight model
            is_night = 1 if (hour >= 20 or hour <= 6) else 0
            
            # Estimate features
            crime_rate = self._estimate_crime_rate(latitude, longitude)
            street_lighting = 0.4 if is_night else 0.9
            cctv_density = kwargs.get('cctv_density', 0.6)
            police_response = kwargs.get('police_response', 15.0)
            foot_traffic = 0.3 if is_night else 0.7
            area_class = kwargs.get('area_classification', 1)
            
            # Create feature array (matching training features)
            features = np.array([[
                latitude,
                longitude,
                hour,
                is_night,
                crime_rate,
                street_lighting,
                cctv_density,
                police_response,
                foot_traffic,
                area_class,
            ]])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            
            # Clamp between 1-10
            prediction = max(1.0, min(10.0, prediction))
            
            return self._format_prediction(prediction)
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(latitude, longitude, hour)
    
    def _estimate_crime_rate(self, lat, lon):
        """Estimate crime rate based on location"""
        
        # Known cities with approximate crime rates
        cities = [
            (19.0760, 72.8777, 3.5),  # Mumbai
            (28.7041, 77.1025, 4.2),  # Delhi
            (12.9716, 77.5946, 2.8),  # Bangalore
            (17.3850, 78.4867, 3.0),  # Hyderabad
            (15.2993, 74.1240, 1.8),  # Goa
            (31.1048, 77.1734, 1.5),  # Shimla
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
    
    def _fallback_prediction(self, lat, lon, hour):
        """Fallback prediction when model not available"""
        
        is_night = hour >= 20 or hour <= 6
        base_score = 6.5
        
        # Night penalty
        if is_night:
            base_score -= 1.5
        
        # Tourist area bonus
        if (14 <= lat <= 16 and 73 <= lon <= 75) or \
           (lat > 30) or \
           (8 <= lat <= 12 and 75 <= lon <= 77):
            base_score += 1.5
        
        score = max(1.0, min(10.0, base_score))
        
        return self._format_prediction(score)
    
    def _format_prediction(self, score):
        """Format prediction response"""
        
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
            'safety_score': round(score, 2),
            'safety_level': level,
            'color': color,
            'recommendations': recommendations
        }


# Singleton instance
_ml_service = None

def get_ml_service():
    """Get ML service singleton"""
    global _ml_service
    if _ml_service is None:
        _ml_service = SafetyMLService()
    return _ml_service
