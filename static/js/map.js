/**
 * Map functionality for safety features
 */

const MapHandler = {
    map: null,
    markers: [],
    
    // Initialize map
    initMap: function(containerId, center = [20.5937, 78.9629], zoom = 6) {
        this.map = L.map(containerId).setView(center, zoom);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        return this.map;
    },
    
    // Add danger zone marker
    addDangerZone: function(lat, lon, data) {
        const color = this.getRiskColor(data.risk_level);
        
        const circle = L.circle([lat, lon], {
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            radius: 2000
        }).addTo(this.map);
        
        const popupContent = `
            <div class="map-popup">
                <h6>${data.zone_type.replace('_', ' ').toUpperCase()}</h6>
                <p><strong>Risk:</strong> ${data.risk_level}</p>
                <p>${data.description}</p>
            </div>
        `;
        
        circle.bindPopup(popupContent);
        this.markers.push(circle);
        
        return circle;
    },
    
    // Add emergency contact marker
    addEmergencyContact: function(lat, lon, data) {
        const icon = L.divIcon({
            className: 'emergency-marker',
            html: this.getServiceIcon(data.service_type),
            iconSize: [32, 32]
        });
        
        const marker = L.marker([lat, lon], { icon: icon }).addTo(this.map);
        
        const popupContent = `
            <div class="map-popup">
                <h6>${data.name}</h6>
                <p><strong>Type:</strong> ${data.service_type.replace('_', ' ')}</p>
                <p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
                ${data.is_24x7 ? '<span class="badge badge-success">24/7 Available</span>' : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        this.markers.push(marker);
        
        return marker;
    },
    
    // Get color based on risk level
    getRiskColor: function(riskLevel) {
        const colors = {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#EF4444',
            'critical': '#7F1D1D'
        };
        return colors[riskLevel] || '#6B7280';
    },
    
    // Get icon for service type
    getServiceIcon: function(serviceType) {
        const icons = {
            'police': '🚔',
            'hospital': '🏥',
            'ambulance': '🚑',
            'fire': '🚒',
            'tourist_helpline': 'ℹ️'
        };
        return `<div style="font-size: 24px;">${icons[serviceType] || '📍'}</div>`;
    },
    
    // Add user location
    addUserLocation: function(lat, lon) {
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div style="font-size: 24px;">📍</div>',
                iconSize: [32, 32]
            })
        }).addTo(this.map);
        
        marker.bindPopup('Your Location');
        this.map.setView([lat, lon], 13);
        
        return marker;
    },
    
    // Get user's current location
    getUserLocation: function(callback) {
        if (navigator.geolocation) {
            YatraSecure.showLoading();
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    YatraSecure.hideLoading();
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    callback({ lat, lon });
                },
                (error) => {
                    YatraSecure.hideLoading();
                    YatraSecure.showNotification('Unable to get your location', 'warning');
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            YatraSecure.showNotification('Geolocation is not supported', 'danger');
        }
    },
    
    // Clear all markers
    clearMarkers: function() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    },
    
    // Fit bounds to show all markers
    fitBounds: function() {
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    },
    
    // Add route
    addRoute: function(waypoints) {
        const latlngs = waypoints.map(wp => [wp.lat, wp.lon]);
        
        const polyline = L.polyline(latlngs, {
            color: '#1E3A8A',
            weight: 4,
            opacity: 0.7
        }).addTo(this.map);
        
        this.markers.push(polyline);
        this.map.fitBounds(polyline.getBounds());
        
        return polyline;
    },
    
    // Add heatmap layer
    addHeatmap: function(data) {
        // data should be array of [lat, lon, intensity]
        const heat = L.heatLayer(data, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.0: 'green',
                0.5: 'yellow',
                0.7: 'orange',
                1.0: 'red'
            }
        }).addTo(this.map);
        
        return heat;
    }
};

// Map styles
const mapStyles = `
<style>
.map-container {
    width: 100%;
    height: 500px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.map-popup h6 {
    margin: 0 0 8px 0;
    color: #1E3A8A;
}

.map-popup p {
    margin: 4px 0;
    font-size: 14px;
}

.emergency-marker {
    background: white;
    border: 2px solid #1E3A8A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.user-location-marker {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.7;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', mapStyles);

// Export
window.MapHandler = MapHandler;
