"""
User model for tourists/travelers
COMPLETE VERSION with Premium Support
"""

from extensions import db
from flask_login import UserMixin
from datetime import datetime


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), index=True)
    profile_picture = db.Column(db.String(255))
    preferred_language = db.Column(db.String(50), default='English')
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    country = db.Column(db.String(50), default='India')
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    
    # Premium subscription fields - NEW
    is_premium = db.Column(db.Boolean, default=False)
    premium_plan = db.Column(db.String(20), nullable=True)  # basic, pro, enterprise
    premium_start_date = db.Column(db.DateTime, nullable=True)
    premium_end_date = db.Column(db.DateTime, nullable=True)
    premium_expiry = db.Column(db.DateTime)  # Legacy field (kept for compatibility)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships - FIXED with explicit foreign_keys
    trips_as_admin = db.relationship('Trip', foreign_keys='Trip.admin_user_id', backref='admin', lazy='dynamic')
    trip_memberships = db.relationship('TripMember', foreign_keys='TripMember.user_id', backref='user', lazy='dynamic')
    expenses_paid = db.relationship('Expense', foreign_keys='Expense.paid_by_user_id', backref='payer', lazy='dynamic')
    
    def get_id(self):
        return str(self.user_id)
    
    @property
    def is_premium_active(self):
        """Check if premium is currently active"""
        if not self.is_premium:
            return False
        # Check premium_end_date first (new field)
        if self.premium_end_date:
            return self.premium_end_date > datetime.utcnow()
        # Fallback to premium_expiry (legacy)
        if self.premium_expiry:
            return self.premium_expiry > datetime.utcnow()
        return True  # If no expiry set, consider active
    
    @property
    def days_until_expiry(self):
        """Get days remaining in premium subscription"""
        if not self.is_premium_active:
            return 0
        expiry = self.premium_end_date or self.premium_expiry
        if expiry:
            delta = expiry - datetime.utcnow()
            return max(0, delta.days)
        return 365  # Default for lifetime
    
    @property
    def premium_days_left(self):
        """Alias for days_until_expiry"""
        return self.days_until_expiry
    
    def __repr__(self):
        return f'<User {self.email}>'


class Trip(db.Model):
    __tablename__ = 'trips'
    
    trip_id = db.Column(db.Integer, primary_key=True)
    trip_name = db.Column(db.String(200), nullable=False)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    join_code = db.Column(db.String(10), unique=True, nullable=False, index=True)
    destination = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    total_budget = db.Column(db.Float)
    trip_type = db.Column(db.String(50))
    status = db.Column(db.String(50), default='planning')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    members = db.relationship('TripMember', foreign_keys='TripMember.trip_id', backref='trip', lazy='dynamic', cascade='all, delete-orphan')
    itinerary = db.relationship('Itinerary', foreign_keys='Itinerary.trip_id', backref='trip', lazy='dynamic', cascade='all, delete-orphan')
    expenses = db.relationship('Expense', foreign_keys='Expense.trip_id', backref='trip', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1
    
    @property
    def member_count(self):
        return self.members.count()
    
    @property
    def total_expenses(self):
        return sum([exp.amount for exp in self.expenses])
    
    def __repr__(self):
        return f'<Trip {self.trip_name}>'


class TripMember(db.Model):
    __tablename__ = 'trip_members'
    
    member_id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    role = db.Column(db.String(20), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('trip_id', 'user_id', name='unique_trip_member'),)
    
    def __repr__(self):
        return f'<TripMember trip:{self.trip_id} user:{self.user_id}>'


class Itinerary(db.Model):
    __tablename__ = 'itinerary'
    
    itinerary_id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    activity = db.Column(db.Text)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    estimated_cost = db.Column(db.Float)
    safety_score = db.Column(db.Float)
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<Itinerary Day {self.day_number} - {self.location}>'


class Expense(db.Model):
    __tablename__ = 'expenses'
    
    expense_id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'), nullable=False)
    paid_by_user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500))
    expense_date = db.Column(db.Date, nullable=False)
    split_type = db.Column(db.String(20), default='equal')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    splits = db.relationship('ExpenseSplit', foreign_keys='ExpenseSplit.expense_id', backref='expense', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Expense ₹{self.amount} - {self.category}>'


class ExpenseSplit(db.Model):
    __tablename__ = 'expense_splits'
    
    split_id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expenses.expense_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    amount_owed = db.Column(db.Float, nullable=False)
    is_paid = db.Column(db.Boolean, default=False)
    
    split_user = db.relationship('User', foreign_keys=[user_id])
    
    def __repr__(self):
        return f'<ExpenseSplit user:{self.user_id} owes ₹{self.amount_owed}>'
