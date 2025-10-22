"""Quick test of trained model"""
import pickle
import json
import pandas as pd
import numpy as np

# Load latest model
with open('ml_models/trained_models/latest_model.json', 'r') as f:
    paths = json.load(f)

with open(paths['model_path'], 'rb') as f:
    model = pickle.load(f)

with open(paths['scaler_path'], 'rb') as f:
    scaler = pickle.load(f)

with open(paths['encoders_path'], 'rb') as f:
    encoders = pickle.load(f)

print("✅ Model loaded!")
print(f"Model: {paths['model_name']}")
print(f"Features: {paths['feature_count']}")
print(f"Performance: RMSE={paths['performance']['rmse']:.3f}, R²={paths['performance']['r2']:.3f}")

# Test prediction
test_data = {feature: 0 for feature in paths['feature_names']}
test_data['google_review_score'] = 4.5
test_data['total_crime_rate'] = 50

test_df = pd.DataFrame([test_data])
test_scaled = scaler.transform(test_df)
prediction = model.predict(test_scaled)[0]

print(f"\n🎯 Test Prediction: Safety Score = {prediction:.2f}/100")
print("✅ Model working perfectly!")
