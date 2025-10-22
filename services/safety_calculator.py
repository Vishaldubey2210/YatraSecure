"""
Safety Calculator with ML Model Integration
"""
import pickle
import json
import pandas as pd
import os

class SafetyCalculator:
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = None
        self.metadata = None
        self.load_model()
    
    def load_model(self):
        """Load trained ML model"""
        try:
            latest_path = 'ml_models/trained_models/latest_model.json'
            
            if not os.path.exists(latest_path):
                print("⚠️ ML model not found")
                return
            
            with open(latest_path, 'r') as f:
                paths = json.load(f)
            
            with open(paths['model_path'], 'rb') as f:
                self.model = pickle.load(f)
            
            with open(paths['scaler_path'], 'rb') as f:
                self.scaler = pickle.load(f)
            
            with open(paths['encoders_path'], 'rb') as f:
                self.encoders = pickle.load(f)
            
            self.metadata = paths
            
            print(f"✅ ML Model loaded: {paths['model_name']}")
            print(f"   Performance: RMSE={paths['performance']['rmse']:.3f}")
            
        except Exception as e:
            print(f"❌ Model load error: {e}")
    
    def predict_safety_score(self, state, district, **features):
        """
        Predict safety score
        
        Args:
            state: State name
            district: District name
            **features: Additional features (optional)
        
        Returns:
            float: Safety score (0-100)
        """
        
        if self.model is None:
            # Fallback to rule-based
            return self._fallback_score(state, district)
        
        try:
            # Prepare input with defaults
            input_data = {feat: 0 for feat in self.metadata['feature_names']}
            
            # Encode state
            if 'state_name' in input_data and state in self.encoders.get('state_name', {}).classes_:
                input_data['state_name'] = self.encoders['state_name'].transform([state])[0]
            
            # Encode district
            if 'district_name' in input_data and district in self.encoders.get('district_name', {}).classes_:
                input_data['district_name'] = self.encoders['district_name'].transform([district])[0]
            
            # Update with provided features
            for key, value in features.items():
                if key in input_data:
                    input_data[key] = value
            
            # Predict
            df = pd.DataFrame([input_data])
            scaled = self.scaler.transform(df)
            score = self.model.predict(scaled)[0]
            
            return round(max(0, min(100, score)), 2)
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_score(state, district)
    
    def _fallback_score(self, state, district):
        """Fallback rule-based scoring"""
        base_score = 65
        
        safe_places = ['Goa', 'Kerala', 'Shimla', 'Pondicherry']
        if any(place in district or place in state for place in safe_places):
            base_score += 15
        
        return base_score

# Global instance
calculator = SafetyCalculator()
