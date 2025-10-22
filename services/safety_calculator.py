"""
Safety Calculator with ML Model Integration
Optimized for Render deployment
"""
import pickle
import json
import os
import traceback

class SafetyCalculator:
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = None
        self.metadata = None
        self.load_ml_model()
    
    def load_ml_model(self):
        """Load trained ML model with error handling"""
        try:
            # Import here to avoid startup errors
            import pandas as pd
            import numpy as np
            
            latest_path = 'ml_models/trained_models/latest_model.json'
            
            if not os.path.exists(latest_path):
                print("⚠️ ML model not found, using fallback scoring")
                return
            
            with open(latest_path, 'r') as f:
                paths = json.load(f)
            
            # Load model components
            with open(paths['model_path'], 'rb') as f:
                self.model = pickle.load(f)
            
            with open(paths['scaler_path'], 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open(paths['encoders_path'], 'rb') as f:
                self.encoders = pickle.load(f)
            
            self.metadata = paths
            
            print(f"✅ ML Model loaded: {paths.get('model_name', 'Unknown')}")
            
        except ImportError as e:
            print(f"⚠️ ML libraries not available: {e}")
            self.model = None
        except Exception as e:
            print(f"⚠️ ML Model loading error: {e}")
            traceback.print_exc()
            self.model = None
    
    def predict_safety_score(self, state, district, **kwargs):
        """
        Calculate safety score using ML model or fallback
        """
        
        if self.model is None:
            return self._rule_based_scoring(state, district, **kwargs)
        
        try:
            import pandas as pd
            import numpy as np
            
            # Prepare input data
            input_data = self._prepare_input(state, district, **kwargs)
            
            # Create DataFrame
            df = pd.DataFrame([input_data])
            
            # Encode categorical
            for col, encoder in self.encoders.items():
                if col in df.columns:
                    try:
                        df[col] = encoder.transform(df[col].astype(str))
                    except:
                        df[col] = 0
            
            # Ensure all features
            for feature in self.metadata['feature_names']:
                if feature not in df.columns:
                    df[feature] = 0
            
            # Reorder
            df = df[self.metadata['feature_names']]
            
            # Scale
            X_scaled = self.scaler.transform(df)
            
            # Predict
            score = self.model.predict(X_scaled)[0]
            
            return round(max(0, min(100, score)), 2)
            
        except Exception as e:
            print(f"ML Prediction error: {e}")
            return self._rule_based_scoring(state, district, **kwargs)
    
    def _prepare_input(self, state, district, **kwargs):
        """Prepare input features with defaults"""
        from datetime import datetime
        
        now = datetime.now()
        hour = now.hour
        
        input_data = {
            'state_name': state,
            'district_name': district,
            'latitude': kwargs.get('latitude', 20.0),
            'longitude': kwargs.get('longitude', 78.0),
            'population_density': kwargs.get('population_density', 1000),
            'literacy_rate': kwargs.get('literacy_rate', 75),
            'avg_income': kwargs.get('avg_income', 15000),
            'gender_ratio': kwargs.get('gender_ratio', 940),
            'urban_rural_category': kwargs.get('urban_rural', 'Urban'),
            
            'total_crime_rate': kwargs.get('crime_rate', 100),
            'women_related_crimes_rate': kwargs.get('women_crimes', 30),
            'theft_rate': kwargs.get('theft_rate', 50),
            'assault_rate': kwargs.get('assault_rate', 20),
            'kidnapping_rate': kwargs.get('kidnapping_rate', 5),
            'cybercrime_rate': kwargs.get('cybercrime', 30),
            'police_station_density': kwargs.get('police_density', 2),
            'emergency_response_time': kwargs.get('response_time', 15),
            'night_safety_index': kwargs.get('night_safety', 60),
            
            'avg_temperature': kwargs.get('temperature', 28),
            'humidity': kwargs.get('humidity', 60),
            'annual_rainfall': kwargs.get('rainfall', 1000),
            'air_quality_index': kwargs.get('aqi', 100),
            'noise_pollution_index': kwargs.get('noise', 50),
            'flood_prone_area': kwargs.get('flood_prone', 0),
            'heatwave_days': kwargs.get('heatwave_days', 10),
            'road_condition_index': kwargs.get('road_condition', 70),
            
            'hospitals_per_km2': kwargs.get('hospitals', 0.5),
            'avg_hospital_rating': kwargs.get('hospital_rating', 4.0),
            'ambulance_availability_score': kwargs.get('ambulance', 70),
            'covid_case_density': kwargs.get('covid_cases', 500),
            'medical_facilities_density': kwargs.get('medical_density', 3),
            'street_lighting_index': kwargs.get('lighting', 70),
            'cctv_coverage': kwargs.get('cctv', 40),
            'road_accident_rate': kwargs.get('accidents', 30),
            
            'google_review_score': kwargs.get('reviews', 4.0),
            'tripadvisor_sentiment': kwargs.get('tripadvisor', 0.7),
            'twitter_sentiment_score': kwargs.get('twitter', 0.6),
            'complaint_mentions': kwargs.get('complaints', 20),
            'travel_blog_sentiment': kwargs.get('blogs', 0.7),
            'photo_scene_safety_score': kwargs.get('photo_safety', 0.8),
            
            'time_of_day': 'day' if 6 <= hour < 18 else 'night',
            'day_of_week': now.strftime('%A'),
            'season': self._get_season(now.month),
            'festival_or_event': kwargs.get('festival', 0),
            'crowd_density_estimate': kwargs.get('crowd', 0.5),
            'holiday_index': kwargs.get('holiday', 0),
            
            'traveler_gender': kwargs.get('gender', 'Male'),
            'traveler_age': kwargs.get('age', 30),
            'travel_type': kwargs.get('travel_type', 'solo'),
            'travel_purpose': kwargs.get('purpose', 'leisure'),
            'travel_time': kwargs.get('travel_time', 'day')
        }
        
        return input_data
    
    def _get_season(self, month):
        """Get season from month"""
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [6, 7, 8, 9]:
            return 'monsoon'
        else:
            return 'summer'
    
    def _rule_based_scoring(self, state, district, **kwargs):
        """Fallback rule-based scoring when ML model unavailable"""
        score = 70  # Base score
        
        # Safe locations
        safe_cities = ['Goa', 'Shimla', 'Mysore', 'Pondicherry', 'Chandigarh', 
                      'Jaipur', 'Kochi', 'Udaipur', 'Hampi', 'Ooty']
        if any(city.lower() in district.lower() or city.lower() in state.lower() 
               for city in safe_cities):
            score += 15
        
        # Adjust based on features
        crime_rate = kwargs.get('crime_rate', 100)
        score -= (crime_rate / 10)
        
        reviews = kwargs.get('reviews', 4.0)
        if reviews >= 4.5:
            score += 10
        elif reviews <= 3.0:
            score -= 10
        
        # Ensure score is within bounds
        return max(0, min(100, round(score, 2)))

# Global instance
calculator = SafetyCalculator()
