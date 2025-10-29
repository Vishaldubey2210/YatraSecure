import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta

# 1. Configuration for Advanced Dummy Data Generation
TOTAL_RECORDS = 100000  # Total number of dummy location records to generate (Can be increased)
random.seed(42) # For reproducibility
np.random.seed(42)

fake = Faker('en_IN') # Indian locality focus

# Dummy list of major states and cities/districts for realism
INDIAN_STATES = ['Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'West Bengal', 'Karnataka', 'Delhi', 'Gujarat', 'Rajasthan', 'Bihar']
MAJOR_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Patna']

# 2. Data Generation Functions for Advanced Metrics

def generate_location_data():
    """Generates basic location, time, and classification data."""
    city = random.choice(MAJOR_CITIES)
    state = random.choice(INDIAN_STATES)
    
    # Simulate a mix of rural, sub-urban, and metro locations
    if city in ['Mumbai', 'Delhi', 'Bengaluru']:
        area_type = random.choices(['Metro Commercial', 'Metro Residential', 'Industrial Zone', 'Tourist Hub'], weights=[0.4, 0.4, 0.1, 0.1], k=1)[0]
        # Coordinates focused on India
        lat = np.random.uniform(18.5, 28.7) 
        lon = np.random.uniform(72.8, 80.2)
    else:
        area_type = random.choices(['Sub-Urban Residential', 'Rural Village', 'Town Center', 'Highway Adjacent'], weights=[0.4, 0.3, 0.2, 0.1], k=1)[0]
        lat = np.random.uniform(10.0, 30.0) 
        lon = np.random.uniform(70.0, 85.0)

    # Time data simulation
    timestamp = datetime.now() - timedelta(days=random.randint(1, 365), hours=random.randint(0, 23))
    
    return {
        'Latitude': round(lat, 6),
        'Longitude': round(lon, 6),
        'State': state,
        'City_District': city,
        'Area_Classification': area_type,
        'Time_Of_Day': timestamp.strftime('%H:%M:%S'),
        'Day_Of_Week': timestamp.strftime('%A'),
    }

def generate_safety_and_crime_data(area_type):
    """Generates detailed crime, lighting, and police data based on Area_Classification."""
    
    # Base risk level adjusted by area type (Metro Commercial areas often have higher reported crime)
    if 'Metro' in area_type or 'Tourist Hub' in area_type:
        base_crime_rate = np.random.uniform(50, 150)
        base_lighting = np.random.uniform(0.7, 0.95)
    elif 'Industrial' in area_type or 'Rural' in area_type:
        base_crime_rate = np.random.uniform(10, 80)
        base_lighting = np.random.uniform(0.3, 0.6)
    else:
        base_crime_rate = np.random.uniform(30, 100)
        base_lighting = np.random.uniform(0.6, 0.85)

    data = {
        # II. Crime & Incident Data
        'Crime_Rate_Per_100K': round(base_crime_rate + np.random.normal(0, 15), 2),
        'Theft_Frequency_Index': np.random.normal(0.5 * base_lighting, 0.2), # Lower lighting = Higher theft
        'Assault_Severity_Index': np.random.uniform(1, 10),
        'Incident_Hotspot_Proximity_Km': round(np.random.exponential(1.5), 2), # Distance from a known hotspot
        
        # III. Infrastructure & Environment Data
        'Street_Lighting_Index': round(np.clip(base_lighting + np.random.normal(0, 0.1), 0.1, 1.0), 2), # 0 to 1
        'CCTV_Density_Score': round(np.clip(base_lighting + np.random.normal(0, 0.1), 0.1, 1.0), 2), # Higher lighting/metro = Higher CCTV
        'Police_Response_Time_Min': round(np.random.normal(10, 5), 1),
        'Refuge_Point_Proximity_Meters': random.randint(50, 500), # Distance to a safe point (Police booth, Hospital, Mall)
    }
    return data

def generate_advanced_metrics(area_type):
    """Generates extremely advanced and behavioral data."""
    
    # IV. Behavioral and Social Dynamics Data (Simulated)
    # Higher Trust in Metro, Lower in Industrial/Rural
    base_trust = 0.8 if 'Metro' in area_type else 0.4
    
    # Higher Foot Traffic in Metro, Lower in Rural
    base_traffic = 0.9 if 'Metro' in area_type else 0.2
    
    data = {
        # I. Geospatial and Environmental Intelligence
        'Visibility_Score_Index': round(np.random.uniform(0.1, 1.0), 2), # 1.0 is high visibility
        'Shadow_Mapping_Index_Night': round(np.clip(1 - (0.5 * generate_safety_and_crime_data(area_type)['Street_Lighting_Index']) + np.random.normal(0, 0.1), 0.1, 1.0), 2), # Higher score = more shadows
        'Noise_Pollution_Level_dB': round(np.random.normal(loc=70, scale=15), 1),
        
        # II. Behavioral and Social Dynamics
        'Local_Sentiment_Index': round(np.clip(base_trust + np.random.normal(0, 0.2), 0.1, 1.0), 2), # Higher = more positive/stable
        'Temporal_Foot_Traffic_Density': round(np.clip(base_traffic + np.random.normal(0, 0.3), 0.05, 1.0), 2),
        'Public_Trust_Index_PTI': round(np.clip(base_trust * 0.9 + np.random.normal(0, 0.1), 0.1, 1.0), 2),
        
        # III. Emergency Services and Security
        'Trauma_Center_Proximity_Km': round(np.random.exponential(5.0), 2),
        'Anomaly_Detection_Alert_Bool': random.choice([True, False, False, False]), # Mostly False
        
        # IV. Personalized/Derived (Dummy)
        'Solo_Female_Travel_Risk_Factor': round(np.clip(0.5 + (1 - base_trust) * 0.4 + np.random.normal(0, 0.1), 0.1, 1.0), 2), # Higher factor = higher risk
    }
    return data

# 3. Main Data Generation Loop

print(f"Generating {TOTAL_RECORDS} advanced dummy data records for India...")

data_list = []
for i in range(TOTAL_RECORDS):
    # Step 1: Generate Core Location
    core_data = generate_location_data()
    area_type = core_data['Area_Classification']
    
    # Step 2: Generate Safety/Crime Metrics
    safety_data = generate_safety_and_crime_data(area_type)
    
    # Step 3: Generate Advanced Metrics
    advanced_data = generate_advanced_metrics(area_type)
    
    # Combine all data dictionaries
    full_record = {**core_data, **safety_data, **advanced_data}
    data_list.append(full_record)
    
    if (i + 1) % 5000 == 0:
        print(f"...{i + 1} records generated.")

# 4. Create DataFrame and Calculate Final Safety Score

df = pd.DataFrame(data_list)

# Optimization: Calculate the Final Safety Score (0 to 100) using a weighted formula
# Note: Low Crime, High Lighting, High Sentiment, Low Shadow = High Safety Score

# Normalize/Invert variables before weighted sum
df['Crime_Weight'] = 1 - (df['Crime_Rate_Per_100K'] / df['Crime_Rate_Per_100K'].max())
df['Lighting_Weight'] = df['Street_Lighting_Index']
df['Sentiment_Weight'] = df['Local_Sentiment_Index']
df['Shadow_Weight'] = 1 - df['Shadow_Mapping_Index_Night']
df['Response_Weight'] = 1 - (df['Police_Response_Time_Min'] / df['Police_Response_Time_Min'].max())
df['FootTraffic_Weight'] = df['Temporal_Foot_Traffic_Density'] # High traffic is mixed, weighted slightly positively

# Weighted Sum to get the final score
weights = {
    'Crime_Weight': 0.30, # Most Important
    'Lighting_Weight': 0.20,
    'Sentiment_Weight': 0.15,
    'Shadow_Weight': 0.10,
    'Response_Weight': 0.15,
    'FootTraffic_Weight': 0.10,
}

df['Calculated_Safety_Score'] = (
    df['Crime_Weight'] * weights['Crime_Weight'] +
    df['Lighting_Weight'] * weights['Lighting_Weight'] +
    df['Sentiment_Weight'] * weights['Sentiment_Weight'] +
    df['Shadow_Weight'] * weights['Shadow_Weight'] +
    df['Response_Weight'] * weights['Response_Weight'] +
    df['FootTraffic_Weight'] * weights['FootTraffic_Weight']
) * 100 # Scale to 0-100

df['Calculated_Safety_Score'] = df['Calculated_Safety_Score'].round(2)

# Optional: Clean up intermediate weight columns
df = df.drop(columns=['Crime_Weight', 'Lighting_Weight', 'Sentiment_Weight', 'Shadow_Weight', 'Response_Weight', 'FootTraffic_Weight'])

# 5. Save the DataFrame to a CSV File
FILE_NAME = 'advanced_india_safety_travel_dummy_data.csv'
df.to_csv(FILE_NAME, index=False)

print("\n--- Generation Complete ---")
print(f"Data saved successfully to: {FILE_NAME}")
print(f"Total columns generated: {len(df.columns)}")
print("Sample Data Head:")
print(df.head().to_markdown(index=False))