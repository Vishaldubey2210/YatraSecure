"""
Emergency Contact and SOS Models
Complete emergency management system
"""

from extensions import db
from datetime import datetime


class EmergencyContact(db.Model):
    """Emergency contacts database"""
    __tablename__ = 'emergency_contacts'
    
    contact_id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    city = db.Column(db.String(100), index=True)
    district = db.Column(db.String(100))
    service_type = db.Column(db.String(50), nullable=False, index=True)  # police, hospital, ambulance, fire, tourist_police
    name = db.Column(db.String(200), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    alternate_phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    landmark = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    is_24x7 = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=True)
    languages_spoken = db.Column(db.String(200))  # Comma-separated
    response_time_minutes = db.Column(db.Integer)
    facilities = db.Column(db.Text)  # JSON array of facilities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def service_icon(self):
        """Get icon for service type"""
        icons = {
            'police': 'shield-fill-check',
            'hospital': 'hospital',
            'ambulance': 'truck',
            'fire': 'fire',
            'tourist_police': 'person-badge'
        }
        return icons.get(self.service_type, 'telephone')
    
    def __repr__(self):
        return f'<EmergencyContact {self.name} - {self.service_type}>'


class SOSAlert(db.Model):
    """SOS alerts raised by users"""
    __tablename__ = 'sos_alerts'
    
    sos_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    location_name = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    alert_type = db.Column(db.String(50), default='general')  # general, medical, crime, accident, lost
    severity = db.Column(db.String(20), default='high')  # low, medium, high, critical
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, responded, resolved, cancelled, false_alarm
    responded_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    response_time_minutes = db.Column(db.Integer)
    emergency_contacts_notified = db.Column(db.Text)  # JSON array of contacts
    authorities_notified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)
    resolved_at = db.Column(db.DateTime)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='sos_alerts')
    trip = db.relationship('Trip', foreign_keys=[trip_id], backref='trip_sos_alerts')
    responder = db.relationship('User', foreign_keys=[responded_by])
    
    @property
    def is_active(self):
        """Check if SOS is still active"""
        return self.status == 'active'
    
    @property
    def duration_minutes(self):
        """Calculate how long SOS has been active"""
        if self.resolved_at:
            delta = self.resolved_at - self.created_at
        else:
            delta = datetime.utcnow() - self.created_at
        return int(delta.total_seconds() / 60)
    
    def __repr__(self):
        return f'<SOSAlert {self.sos_id} - {self.status}>'


class EmergencyCheckIn(db.Model):
    """Periodic check-ins for safety"""
    __tablename__ = 'emergency_checkins'
    
    checkin_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_name = db.Column(db.String(200))
    status = db.Column(db.String(20), default='safe')  # safe, help_needed, missed
    message = db.Column(db.Text)
    battery_level = db.Column(db.Integer)  # 0-100
    next_checkin_due = db.Column(db.DateTime)
    is_automated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='safety_checkins')
    trip = db.relationship('Trip', backref='trip_checkins')
    
    def __repr__(self):
        return f'<EmergencyCheckIn {self.checkin_id} - {self.status}>'
