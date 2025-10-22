"""
Tourist Circuit Models
Curated tourist circuits and destinations
"""

from extensions import db
from datetime import datetime
import json


class TouristCircuit(db.Model):
    """Pre-planned tourist circuits"""
    __tablename__ = 'tourist_circuits'
    
    circuit_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(100), nullable=False, index=True)
    region = db.Column(db.String(100))
    description = db.Column(db.Text)
    duration_days = db.Column(db.Integer)
    difficulty_level = db.Column(db.String(20))  # easy, moderate, difficult, challenging
    best_season = db.Column(db.String(50))
    estimated_cost = db.Column(db.Float)
    circuit_type = db.Column(db.String(50))  # heritage, adventure, spiritual, nature, beach
    highlights = db.Column(db.Text)  # JSON array
    included_services = db.Column(db.Text)  # JSON array
    excluded_services = db.Column(db.Text)  # JSON array
    is_featured = db.Column(db.Boolean, default=False)
    is_popular = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    total_bookings = db.Column(db.Integer, default=0)
    images = db.Column(db.Text)  # JSON array
    video_url = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    destinations = db.relationship('CircuitDestination', backref='circuit', lazy='dynamic', cascade='all, delete-orphan', order_by='CircuitDestination.day_number')
    
    @property
    def destination_count(self):
        """Get number of destinations"""
        return self.destinations.count()
    
    @property
    def highlight_list(self):
        """Get highlights as list"""
        try:
            return json.loads(self.highlights) if self.highlights else []
        except:
            return []
    
    def __repr__(self):
        return f'<TouristCircuit {self.name}>'


class CircuitDestination(db.Model):
    """Destinations in a circuit"""
    __tablename__ = 'circuit_destinations'
    
    destination_id = db.Column(db.Integer, primary_key=True)
    circuit_id = db.Column(db.Integer, db.ForeignKey('tourist_circuits.circuit_id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    description = db.Column(db.Text)
    activities = db.Column(db.Text)  # JSON array
    duration_hours = db.Column(db.Integer)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    recommended_duration = db.Column(db.String(50))
    entry_fee = db.Column(db.Float)
    opening_hours = db.Column(db.String(100))
    best_time_to_visit = db.Column(db.String(100))
    tips = db.Column(db.Text)
    images = db.Column(db.Text)  # JSON array
    
    def __repr__(self):
        return f'<CircuitDestination Day {self.day_number} - {self.name}>'


class PopularDestination(db.Model):
    """Popular standalone destinations"""
    __tablename__ = 'popular_destinations'
    
    destination_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    category = db.Column(db.String(50))  # historical, natural, religious, adventure, beach
    description = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    best_season = db.Column(db.String(50))
    average_visit_duration = db.Column(db.String(50))
    entry_fee = db.Column(db.Float)
    opening_hours = db.Column(db.String(100))
    rating = db.Column(db.Float, default=0.0)
    total_visitors = db.Column(db.Integer, default=0)
    is_unesco_site = db.Column(db.Boolean, default=False)
    facilities = db.Column(db.Text)  # JSON array
    images = db.Column(db.Text)  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PopularDestination {self.name} - {self.city}>'
