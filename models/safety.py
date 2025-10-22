"""
Safety Models
"""

from extensions import db
from datetime import datetime

class SafetyAlert(db.Model):
    __tablename__ = 'safety_alerts'
    
    alert_id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20), default='medium')  # low, medium, high
    alert_type = db.Column(db.String(50), nullable=False)  # crime, weather, traffic, health
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<SafetyAlert {self.title}>'


class CommunityReport(db.Model):
    __tablename__ = 'community_reports'
    
    report_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20))
    is_verified = db.Column(db.Boolean, default=False)
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    reporter = db.relationship('User', foreign_keys=[user_id], backref='reports')
    
    def __repr__(self):
        return f'<CommunityReport {self.report_id}>'
