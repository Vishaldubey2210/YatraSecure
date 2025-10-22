"""
Security utility functions
"""

from flask_bcrypt import Bcrypt
from flask import current_app
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask_login import current_user
from flask import redirect, url_for, flash

bcrypt = Bcrypt()

def hash_password(password):
    """
    Hash a password using bcrypt
    
    Args:
        password (str): Plain text password
    
    Returns:
        str: Hashed password
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')

def check_password(hashed_password, password):
    """
    Check if password matches hash
    
    Args:
        hashed_password (str): Hashed password
        password (str): Plain text password to check
    
    Returns:
        bool: True if password matches
    """
    return bcrypt.check_password_hash(hashed_password, password)

def generate_token(user_id, expiry_hours=24):
    """
    Generate JWT token for password reset or verification
    
    Args:
        user_id (int): User ID
        expiry_hours (int): Token validity in hours
    
    Returns:
        str: JWT token
    """
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=expiry_hours),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return token

def verify_token(token):
    """
    Verify JWT token
    
    Args:
        token (str): JWT token
    
    Returns:
        int or None: User ID if valid, None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def premium_required(f):
    """
    Decorator to require premium subscription for routes
    
    Usage:
        @app.route('/premium-feature')
        @login_required
        @premium_required
        def premium_feature():
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this feature.', 'info')
            return redirect(url_for('auth.login'))
        
        if not current_user.is_premium:
            flash('This feature requires YatraSecure Premium subscription.', 'warning')
            return redirect(url_for('dashboard.premium'))
        
        if current_user.premium_expiry and current_user.premium_expiry < datetime.now():
            flash('Your premium subscription has expired. Please renew.', 'warning')
            return redirect(url_for('dashboard.premium'))
        
        return f(*args, **kwargs)
    
    return decorated_function

def admin_required(f):
    """
    Decorator to require admin access
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'info')
            return redirect(url_for('auth.login'))
        
        # Check if user is admin (you can add is_admin field to User model)
        if not getattr(current_user, 'is_admin', False):
            flash('You do not have permission to access this page.', 'danger')
            return redirect(url_for('dashboard.user_dashboard'))
        
        return f(*args, **kwargs)
    
    return decorated_function

def sanitize_input(text):
    """
    Sanitize user input to prevent XSS
    
    Args:
        text (str): User input
    
    Returns:
        str: Sanitized text
    """
    if not text:
        return text
    
    # Basic XSS prevention - remove script tags
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<iframe[^>]*>.*?</iframe>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    return text.strip()
