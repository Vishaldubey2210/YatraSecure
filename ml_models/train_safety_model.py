"""
YatraSecure - Safety Score Prediction Model
Train ML model to predict safety scores based on location and environmental factors
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def train_safety_model():
    """Train safety prediction model"""
    
    print("🚀 Loading dataset...")
    df = pd.read_csv('advanced_india_safety_travel_dummy_data.csv')
    
    print(f"✅ Dataset loaded: {len(df)} records")
    print(f"📊 Columns: {df.columns.tolist()}")
    
    # Feature engineering
    print("\n🔧 Feature Engineering...")
    
    # Encode categorical variables
    label_encoders = {}
    categorical_cols = ['State', 'City_District', 'Area_Classification', 'Time_Of_Day', 'Day_Of_Week']
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Time features
    df['Hour'] = pd.to_datetime(df['Time_Of_Day']).dt.hour
    df['Is_Night'] = (df['Hour'] >= 20) | (df['Hour'] <= 6)
    df['Is_Weekend'] = df['Day_Of_Week'].isin(['Saturday', 'Sunday'])
    
    # Select features for model
    feature_cols = [
        'Latitude', 'Longitude',
        'State_encoded', 'City_District_encoded', 'Area_Classification_encoded',
        'Hour', 'Is_Night', 'Is_Weekend',
        'Crime_Rate_Per_100K', 'Theft_Frequency_Index', 'Assault_Severity_Index',
        'Incident_Hotspot_Proximity_Km', 'Street_Lighting_Index', 'CCTV_Density_Score',
        'Police_Response_Time_Min', 'Refuge_Point_Proximity_Meters',
        'Visibility_Score_Index', 'Shadow_Mapping_Index_Night',
        'Noise_Pollution_Level_dB', 'Local_Sentiment_Index',
        'Temporal_Foot_Traffic_Density', 'Public_Trust_Index_PTI',
        'Trauma_Center_Proximity_Km', 'Anomaly_Detection_Alert_Bool',
        'Solo_Female_Travel_Risk_Factor'
    ]
    
    X = df[feature_cols]
    y = df['Calculated_Safety_Score']
    
    print(f"\n📈 Features: {len(feature_cols)}")
    print(f"🎯 Target: Calculated_Safety_Score (Range: {y.min():.2f} - {y.max():.2f})")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    print("\n⚖️ Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    print("\n🌲 Training Random Forest Model...")
    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=10,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred_train = rf_model.predict(X_train_scaled)
    y_pred_test = rf_model.predict(X_test_scaled)
    
    # Metrics
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    
    print("\n📊 Model Performance:")
    print(f"  Train MAE: {train_mae:.2f}")
    print(f"  Test MAE: {test_mae:.2f}")
    print(f"  Train R²: {train_r2:.4f}")
    print(f"  Test R²: {test_r2:.4f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔝 Top 10 Important Features:")
    print(feature_importance.head(10))
    
    # Save model and artifacts
    print("\n💾 Saving model...")
    os.makedirs('ml_models/saved_models', exist_ok=True)
    
    joblib.dump(rf_model, 'ml_models/saved_models/safety_model.pkl')
    joblib.dump(scaler, 'ml_models/saved_models/scaler.pkl')
    joblib.dump(label_encoders, 'ml_models/saved_models/label_encoders.pkl')
    joblib.dump(feature_cols, 'ml_models/saved_models/feature_cols.pkl')
    
    print("✅ Model saved successfully!")
    print("\nFiles saved:")
    print("  - ml_models/saved_models/safety_model.pkl")
    print("  - ml_models/saved_models/scaler.pkl")
    print("  - ml_models/saved_models/label_encoders.pkl")
    print("  - ml_models/saved_models/feature_cols.pkl")
    
    return rf_model, scaler, label_encoders, feature_cols


if __name__ == '__main__':
    train_safety_model()
