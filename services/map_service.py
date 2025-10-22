"""
OpenStreetMap integration service
"""

import folium
from folium import plugins
import requests

class MapService:
    def __init__(self):
        """Initialize map service"""
        self.osm_nominatim_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {
            'User-Agent': 'YatraSecure/1.0'
        }
    
    def geocode_location(self, location_name):
        """
        Get coordinates for a location name
        
        Args:
            location_name (str): Location name
        
        Returns:
            tuple: (latitude, longitude) or None
        """
        try:
            params = {
                'q': location_name,
                'format': 'json',
                'limit': 1
            }
            
            response = requests.get(
                self.osm_nominatim_url,
                params=params,
                headers=self.headers,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    return float(data[0]['lat']), float(data[0]['lon'])
        
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    def create_safety_map(self, center_lat, center_lon, zoom=12, danger_zones=None, emergency_contacts=None):
        """
        Create interactive safety map with danger zones and emergency contacts
        
        Args:
            center_lat (float): Center latitude
            center_lon (float): Center longitude
            zoom (int): Zoom level
            danger_zones (list): List of SafetyZone objects
            emergency_contacts (list): List of EmergencyContact objects
        
        Returns:
            str: HTML map
        """
        # Create base map
        safety_map = folium.Map(
            location=[center_lat, center_lon],
            zoom_start=zoom,
            tiles='OpenStreetMap'
        )
        
        # Add danger zones
        if danger_zones:
            for zone in danger_zones:
                color = self._get_risk_color(zone.risk_level)
                
                folium.CircleMarker(
                    location=[zone.latitude, zone.longitude],
                    radius=15,
                    popup=folium.Popup(
                        f"<b>{zone.zone_type.replace('_', ' ').title()}</b><br>"
                        f"Risk: {zone.risk_level.title()}<br>"
                        f"{zone.description}",
                        max_width=300
                    ),
                    color=color,
                    fill=True,
                    fillColor=color,
                    fillOpacity=0.6
                ).add_to(safety_map)
        
        # Add emergency contacts
        if emergency_contacts:
            for contact in emergency_contacts:
                if contact.latitude and contact.longitude:
                    icon_color = self._get_service_icon_color(contact.service_type)
                    
                    folium.Marker(
                        location=[contact.latitude, contact.longitude],
                        popup=folium.Popup(
                            f"<b>{contact.name}</b><br>"
                            f"Type: {contact.service_type.replace('_', ' ').title()}<br>"
                            f"Phone: {contact.phone}<br>"
                            f"{'24/7 Available' if contact.is_24x7 else 'Limited Hours'}",
                            max_width=300
                        ),
                        icon=folium.Icon(color=icon_color, icon='info-sign')
                    ).add_to(safety_map)
        
        # Add fullscreen button
        plugins.Fullscreen().add_to(safety_map)
        
        # Add locate control
        plugins.LocateControl().add_to(safety_map)
        
        return safety_map._repr_html_()
    
    def create_heatmap(self, center_lat, center_lon, heat_data, zoom=12):
        """
        Create safety heatmap
        
        Args:
            center_lat (float): Center latitude
            center_lon (float): Center longitude
            heat_data (list): List of [lat, lon, intensity] points
            zoom (int): Zoom level
        
        Returns:
            str: HTML map
        """
        heatmap = folium.Map(
            location=[center_lat, center_lon],
            zoom_start=zoom,
            tiles='OpenStreetMap'
        )
        
        # Add heatmap layer
        plugins.HeatMap(
            heat_data,
            min_opacity=0.3,
            max_zoom=18,
            radius=25,
            blur=15,
            gradient={
                0.0: 'green',
                0.5: 'yellow',
                0.7: 'orange',
                1.0: 'red'
            }
        ).add_to(heatmap)
        
        plugins.Fullscreen().add_to(heatmap)
        
        return heatmap._repr_html_()
    
    def _get_risk_color(self, risk_level):
        """Get color for risk level"""
        colors = {
            'low': 'green',
            'medium': 'orange',
            'high': 'red',
            'critical': 'darkred'
        }
        return colors.get(risk_level.lower(), 'gray')
    
    def _get_service_icon_color(self, service_type):
        """Get icon color for emergency service type"""
        colors = {
            'police': 'blue',
            'hospital': 'red',
            'ambulance': 'red',
            'fire': 'orange',
            'tourist_helpline': 'green'
        }
        return colors.get(service_type, 'gray')


# Singleton instance
_map_service = None

def get_map_service():
    """Get or create map service instance"""
    global _map_service
    if _map_service is None:
        _map_service = MapService()
    return _map_service
