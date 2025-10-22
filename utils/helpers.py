"""
Helper utility functions used across the application
"""

import random
import string
from datetime import datetime, timedelta
import os
from werkzeug.utils import secure_filename
from flask import current_app

def generate_join_code(length=4):
    """
    Generate a random 4-digit join code for trips
    
    Args:
        length (int): Length of the code (default: 4)
    
    Returns:
        str: Random numeric code
    """
    return ''.join(random.choices(string.digits, k=length))

def generate_unique_filename(filename):
    """
    Generate a unique filename to avoid collisions
    
    Args:
        filename (str): Original filename
    
    Returns:
        str: Unique filename with timestamp
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name, ext = os.path.splitext(secure_filename(filename))
    return f"{name}_{timestamp}{ext}"

def allowed_file(filename):
    """
    Check if file extension is allowed
    
    Args:
        filename (str): Filename to check
    
    Returns:
        bool: True if allowed, False otherwise
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def get_safety_level(score):
    """
    Get safety level description based on score
    
    Args:
        score (float): Safety score (0-100)
    
    Returns:
        dict: Safety level info with color and text
    """
    thresholds = current_app.config['SAFETY_THRESHOLDS']
    
    if score >= thresholds['safe']:
        return {'level': 'Very Safe', 'color': 'success', 'icon': 'shield-check'}
    elif score >= thresholds['medium_risk']:
        return {'level': 'Safe', 'color': 'info', 'icon': 'shield'}
    elif score >= thresholds['high_risk']:
        return {'level': 'Moderate Risk', 'color': 'warning', 'icon': 'shield-exclamation'}
    elif score >= thresholds['critical']:
        return {'level': 'High Risk', 'color': 'danger', 'icon': 'shield-x'}
    else:
        return {'level': 'Critical Risk', 'color': 'dark', 'icon': 'exclamation-triangle'}

def calculate_trip_duration(start_date, end_date):
    """
    Calculate trip duration in days
    
    Args:
        start_date (datetime): Trip start date
        end_date (datetime): Trip end date
    
    Returns:
        int: Number of days
    """
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    
    return (end_date - start_date).days + 1

def get_premium_price(trip_duration):
    """
    Calculate premium price based on trip duration
    
    Args:
        trip_duration (int): Number of days
    
    Returns:
        dict: Price info with amount and plan name
    """
    pricing = current_app.config['PRICING']
    
    if trip_duration <= 3:
        return {'amount': pricing['weekend_trip'], 'plan': 'Weekend Trip'}
    elif trip_duration <= 7:
        return {'amount': pricing['single_trip'], 'plan': 'Single Trip'}
    elif trip_duration <= 15:
        return {'amount': pricing['long_trip'], 'plan': 'Long Trip'}
    else:
        return {'amount': pricing['monthly'], 'plan': 'Monthly Unlimited'}

def format_phone_number(phone):
    """
    Format phone number to standard format
    
    Args:
        phone (str): Phone number
    
    Returns:
        str: Formatted phone number
    """
    # Remove all non-numeric characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Add +91 if not present and length is 10
    if len(digits) == 10:
        return f"+91{digits}"
    elif len(digits) == 12 and digits.startswith('91'):
        return f"+{digits}"
    else:
        return phone

def calculate_expense_split(total_amount, members, split_type='equal', custom_splits=None):
    """
    Calculate expense split among trip members
    
    Args:
        total_amount (float): Total expense amount
        members (list): List of member user_ids
        split_type (str): 'equal', 'custom', or 'percentage'
        custom_splits (dict): Custom split amounts/percentages
    
    Returns:
        dict: Member-wise split amounts
    """
    splits = {}
    
    if split_type == 'equal':
        per_person = round(total_amount / len(members), 2)
        for member in members:
            splits[member] = per_person
        
        # Adjust for rounding errors
        difference = total_amount - sum(splits.values())
        if difference != 0:
            splits[members[0]] += difference
    
    elif split_type == 'custom' and custom_splits:
        splits = custom_splits
    
    elif split_type == 'percentage' and custom_splits:
        for member, percentage in custom_splits.items():
            splits[member] = round((percentage / 100) * total_amount, 2)
    
    return splits

def get_risk_color(risk_level):
    """
    Get Bootstrap color class for risk level
    
    Args:
        risk_level (str): Risk level (low, medium, high, critical)
    
    Returns:
        str: Bootstrap color class
    """
    risk_colors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'danger',
        'critical': 'dark'
    }
    return risk_colors.get(risk_level.lower(), 'secondary')

def get_alert_icon(alert_type):
    """
    Get icon class for alert type
    
    Args:
        alert_type (str): Type of alert
    
    Returns:
        str: Icon class name
    """
    icons = {
        'weather': 'cloud-rain',
        'protest': 'megaphone',
        'crime': 'shield-x',
        'health': 'heart-pulse',
        'government_advisory': 'file-text'
    }
    return icons.get(alert_type, 'info-circle')

def paginate_results(query, page, per_page):
    """
    Paginate query results
    
    Args:
        query: SQLAlchemy query object
        page (int): Current page number
        per_page (int): Items per page
    
    Returns:
        dict: Pagination info with items and metadata
    """
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return {
        'items': pagination.items,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_prev': pagination.has_prev,
        'has_next': pagination.has_next,
        'prev_page': pagination.prev_num,
        'next_page': pagination.next_num
    }

def is_premium_active(user):
    """
    Check if user's premium subscription is active
    
    Args:
        user: User object
    
    Returns:
        bool: True if premium is active
    """
    if not user.is_premium:
        return False
    
    if user.premium_expiry:
        return user.premium_expiry > datetime.now()
    
    return False

def days_until_expiry(expiry_date):
    """
    Calculate days until premium expiry
    
    Args:
        expiry_date (datetime): Premium expiry date
    
    Returns:
        int: Days remaining (negative if expired)
    """
    if not expiry_date:
        return 0
    
    return (expiry_date - datetime.now()).days
