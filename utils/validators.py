"""
Validation utilities for YatraSecure
"""

import re
from datetime import datetime

def validate_email(email):
    """
    Validate email format
    Returns: (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    # Email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    return True, None


def validate_password(password):
    """
    Validate password strength
    Requirements: 
    - At least 8 characters
    - Contains uppercase
    - Contains lowercase
    - Contains number
    Returns: (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, None


def validate_phone(phone):
    """
    Validate Indian phone number
    Returns: (is_valid, error_message)
    """
    if not phone:
        return True, None  # Phone is optional
    
    # Remove spaces and special characters
    phone_clean = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Indian phone number patterns
    patterns = [
        r'^[6-9]\d{9}$',  # 10 digits starting with 6-9
        r'^\+91[6-9]\d{9}$',  # With +91
        r'^91[6-9]\d{9}$'  # With 91
    ]
    
    for pattern in patterns:
        if re.match(pattern, phone_clean):
            return True, None
    
    return False, "Invalid Indian phone number"


def validate_date_range(start_date, end_date):
    """
    Validate date range
    Returns: (is_valid, error_message)
    """
    if not start_date or not end_date:
        return False, "Both start and end dates are required"
    
    # Convert strings to datetime if needed
    if isinstance(start_date, str):
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            return False, "Invalid start date format"
    
    if isinstance(end_date, str):
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return False, "Invalid end date format"
    
    # Check if start date is in the past
    if start_date < datetime.now().date():
        return False, "Start date cannot be in the past"
    
    # Check if end date is after start date
    if end_date <= start_date:
        return False, "End date must be after start date"
    
    return True, None


def validate_budget(budget):
    """
    Validate budget amount
    Returns: (is_valid, error_message)
    """
    if budget is None:
        return True, None  # Budget is optional
    
    try:
        budget = float(budget)
    except (ValueError, TypeError):
        return False, "Budget must be a valid number"
    
    if budget < 0:
        return False, "Budget cannot be negative"
    
    if budget > 10000000:  # 1 crore max
        return False, "Budget seems unrealistic"
    
    return True, None


def validate_join_code(code):
    """
    Validate trip join code
    Returns: (is_valid, error_message)
    """
    if not code:
        return False, "Join code is required"
    
    # Code should be 6 alphanumeric characters
    if not re.match(r'^[A-Z0-9]{6}$', code.upper()):
        return False, "Invalid join code format (should be 6 characters)"
    
    return True, None


def sanitize_input(text):
    """
    Sanitize user input to prevent XSS
    """
    if not text:
        return text
    
    # Remove HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    
    # Remove potentially dangerous characters
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    
    return text.strip()
