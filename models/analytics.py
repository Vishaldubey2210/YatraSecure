"""
Analytics and Tracking Models
User activity and system analytics
"""

from extensions import db
from datetime import datetime, timedelta


class UserActivity(db.Model):
    """Track user activities"""
    __tablename__ = 'user_activities'
    
    activity_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    activity_type = db.Column(db.String(50), nullable=False, index=True)  # trip_created, booking_made, login, etc.
    description = db.Column(db.Text)
    resource_id = db.Column(db.Integer)  # ID of related resource (trip_id, booking_id, etc.)
    resource_type = db.Column(db.String(50))  # trip, booking, provider, etc.
    metadata = db.Column(db.Text)  # JSON data with additional info
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(300))
    device_type = db.Column(db.String(50))  # mobile, tablet, desktop
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = db.relationship('User', backref='activities')
    
    def __repr__(self):
        return f'<UserActivity {self.activity_type} by user:{self.user_id}>'


class SearchLog(db.Model):
    """Search query logs"""
    __tablename__ = 'search_logs'
    
    log_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    search_query = db.Column(db.String(300), nullable=False, index=True)
    search_type = db.Column(db.String(50))  # destination, provider, trip, service
    filters_applied = db.Column(db.Text)  # JSON of filters
    results_count = db.Column(db.Integer, default=0)
    clicked_result_id = db.Column(db.Integer)  # Which result user clicked
    clicked_position = db.Column(db.Integer)  # Position of clicked result
    session_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<SearchLog "{self.search_query}">'


class PageView(db.Model):
    """Page view tracking"""
    __tablename__ = 'page_views'
    
    view_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    page_url = db.Column(db.String(500), nullable=False)
    page_title = db.Column(db.String(200))
    referrer = db.Column(db.String(500))
    session_id = db.Column(db.String(100), index=True)
    duration_seconds = db.Column(db.Integer)  # Time spent on page
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<PageView {self.page_url}>'


class SystemMetric(db.Model):
    """System performance metrics"""
    __tablename__ = 'system_metrics'
    
    metric_id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False, index=True)
    metric_value = db.Column(db.Float, nullable=False)
    metric_unit = db.Column(db.String(50))
    category = db.Column(db.String(50))  # performance, usage, business
    tags = db.Column(db.Text)  # JSON array of tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<SystemMetric {self.metric_name}: {self.metric_value}>'


class ErrorLog(db.Model):
    """Application error logging"""
    __tablename__ = 'error_logs'
    
    error_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    error_type = db.Column(db.String(100), nullable=False, index=True)
    error_message = db.Column(db.Text)
    stack_trace = db.Column(db.Text)
    request_url = db.Column(db.String(500))
    request_method = db.Column(db.String(10))
    request_data = db.Column(db.Text)  # JSON
    severity = db.Column(db.String(20), default='error')  # debug, info, warning, error, critical
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<ErrorLog {self.error_type}>'
