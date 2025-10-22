"""
Service Provider model (Hotels, Guides, Transport)
Merged with new architecture
"""

from extensions import db
from flask_login import UserMixin
from datetime import datetime


class ServiceProvider(UserMixin, db.Model):
    __tablename__ = 'service_providers'
    
    provider_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    business_name = db.Column(db.String(200), nullable=False)
    provider_type = db.Column(db.String(50), nullable=False)  # hotel, guide, transport
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10))
    description = db.Column(db.Text)
    profile_image = db.Column(db.String(255))
    license_number = db.Column(db.String(100))
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships - Using unique backref names
    services = db.relationship('Service', backref='provider', lazy='dynamic', cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='provider', lazy='dynamic')
    reviews = db.relationship('ServiceReview', backref='provider', lazy='dynamic')
    
    def get_id(self):
        """For Flask-Login - provider authentication"""
        return f'provider_{self.provider_id}'
    
    @property
    def total_bookings(self):
        """Get total bookings count"""
        return self.bookings.count()
    
    @property
    def completed_bookings(self):
        """Get completed bookings count"""
        return self.bookings.filter_by(booking_status='completed').count()
    
    def update_rating(self):
        """Update average rating from reviews"""
        reviews = self.reviews.all()
        if reviews:
            total_rating = sum([r.rating for r in reviews])
            self.rating = round(total_rating / len(reviews), 2)
            self.total_reviews = len(reviews)
            db.session.commit()
    
    def __repr__(self):
        return f'<ServiceProvider {self.business_name}>'


class Service(db.Model):
    __tablename__ = 'services'
    
    service_id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.provider_id'), nullable=False)
    service_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.String(50))  # e.g., "per night", "per hour", "per day"
    capacity = db.Column(db.Integer)  # Max people/rooms
    images = db.Column(db.Text)  # JSON string of image URLs
    is_available = db.Column(db.Boolean, default=True)
    availability = db.Column(db.Boolean, default=True)  # Alias for compatibility
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    service_bookings = db.relationship('Booking', backref='service', lazy='dynamic')
    
    def __repr__(self):
        return f'<Service {self.service_name}>'


class Booking(db.Model):
    """
    Main Booking model - handles all service bookings
    Previously named ServiceBooking for clarity
    """
    __tablename__ = 'bookings'
    
    booking_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.provider_id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'))
    booking_type = db.Column(db.String(50), nullable=False)  # hotel, guide, transport
    check_in_date = db.Column(db.Date)
    check_out_date = db.Column(db.Date)
    total_amount = db.Column(db.Float, nullable=False)
    booking_status = db.Column(db.String(50), default='pending')  # pending, confirmed, completed, cancelled
    payment_status = db.Column(db.String(50), default='unpaid')  # unpaid, paid, refunded
    special_requests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - using explicit foreign_keys to avoid conflicts
    user = db.relationship('User', foreign_keys=[user_id], backref='user_bookings')
    trip = db.relationship('Trip', foreign_keys=[trip_id], backref='trip_bookings')
    
    @property
    def duration_days(self):
        """Calculate booking duration in days"""
        if self.check_in_date and self.check_out_date:
            return (self.check_out_date - self.check_in_date).days
        return 0
    
    @property
    def is_active(self):
        """Check if booking is currently active"""
        return self.booking_status in ['pending', 'confirmed']
    
    @property
    def can_cancel(self):
        """Check if booking can be cancelled"""
        return self.booking_status in ['pending', 'confirmed']
    
    def __repr__(self):
        return f'<Booking {self.booking_id} - {self.booking_status}>'


class ServiceReview(db.Model):
    """
    Service Review model - for rating providers and locations
    Previously just named Review
    """
    __tablename__ = 'reviews'
    
    review_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.provider_id'))
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'))
    location_name = db.Column(db.String(200))
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    review_text = db.Column(db.Text)
    review_type = db.Column(db.String(50), nullable=False)  # provider, location, experience
    images = db.Column(db.Text)  # JSON string of image URLs
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='user_reviews')
    booking = db.relationship('Booking', foreign_keys=[booking_id], backref='review')
    
    # Constraints
    __table_args__ = (
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
    
    @property
    def rating_stars(self):
        """Get star rating as string"""
        return '⭐' * self.rating
    
    def __repr__(self):
        return f'<ServiceReview {self.rating}⭐ by user:{self.user_id}>'
