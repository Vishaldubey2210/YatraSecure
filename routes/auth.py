"""
Authentication routes - Login, Signup, Logout
✅ FIXED: Login redirect validation for Railway deployment
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from urllib.parse import urlparse, urljoin

# Import from extensions
from extensions import db, bcrypt

auth_bp = Blueprint('auth', __name__)


def is_safe_url(target):
    """Check if URL is safe for redirect - prevents open redirect attacks"""
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc


@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    """User registration"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.user_dashboard'))
    
    if request.method == 'POST':
        from models.user import User
        from utils.validators import validate_email, validate_phone, validate_password
        
        try:
            # Get form data
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            full_name = request.form.get('full_name', '').strip()
            phone = request.form.get('phone', '').strip()
            preferred_language = request.form.get('preferred_language', 'English')
            
            # Basic validation
            if not email or not password or not full_name:
                flash('Please fill all required fields!', 'danger')
                return render_template('auth/signup.html')
            
            # Validate email
            is_valid_email, email_error = validate_email(email)
            if not is_valid_email:
                flash(email_error, 'danger')
                return render_template('auth/signup.html')
            
            # Validate password
            is_valid_password, password_error = validate_password(password)
            if not is_valid_password:
                flash(password_error, 'danger')
                return render_template('auth/signup.html')
            
            if password != confirm_password:
                flash('Passwords do not match!', 'danger')
                return render_template('auth/signup.html')
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                flash('Email already registered. Please login.', 'warning')
                return redirect(url_for('auth.login'))
            
            # Create new user
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            new_user = User(
                email=email,
                password_hash=password_hash,
                full_name=full_name,
                phone=phone,
                preferred_language=preferred_language
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            flash('Account created successfully! Please login.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'An error occurred. Please try again.', 'danger')
            print(f"Signup error: {e}")
            import traceback
            traceback.print_exc()
    
    return render_template('auth/signup.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login - FIXED for Railway deployment"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.user_dashboard'))
    
    if request.method == 'POST':
        from models.user import User
        
        try:
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            remember = request.form.get('remember', False)
            
            if not email or not password:
                flash('Please enter both email and password.', 'danger')
                return render_template('auth/login.html')
            
            # Find user
            user = User.query.filter_by(email=email).first()
            
            if user and bcrypt.check_password_hash(user.password_hash, password):
                # Update last login
                user.last_login = datetime.utcnow()
                db.session.commit()
                
                # Login user
                login_user(user, remember=remember)
                flash(f'Welcome back, {user.full_name}!', 'success')
                
                # ✅ FIXED: Better redirect logic with validation
                next_page = request.args.get('next')
                
                # Validate next_page to prevent open redirect attacks
                if next_page and is_safe_url(next_page):
                    return redirect(next_page)
                else:
                    # Default redirect to dashboard
                    return redirect(url_for('dashboard.user_dashboard'))
            else:
                flash('Invalid email or password.', 'danger')
                
        except Exception as e:
            flash(f'Login error. Please try again.', 'danger')
            print(f"Login error: {e}")
            import traceback
            traceback.print_exc()
    
    return render_template('auth/login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))


@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.user_dashboard'))
    
    if request.method == 'POST':
        from models.user import User
        
        try:
            email = request.form.get('email', '').strip()
            user = User.query.filter_by(email=email).first()
            
            if user:
                # TODO: Send actual password reset email
                flash('Password reset instructions sent to your email.', 'info')
                return redirect(url_for('auth.login'))
            else:
                flash('Email not found.', 'danger')
        except Exception as e:
            flash('An error occurred.', 'danger')
            print(f"Forgot password error: {e}")
    
    return render_template('auth/forgot_password.html')


@auth_bp.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    """Edit user profile"""
    if request.method == 'POST':
        try:
            current_user.full_name = request.form.get('full_name', current_user.full_name)
            current_user.phone = request.form.get('phone', current_user.phone)
            current_user.emergency_contact_name = request.form.get('emergency_contact_name')
            current_user.emergency_contact_phone = request.form.get('emergency_contact_phone')
            current_user.preferred_language = request.form.get('preferred_language', current_user.preferred_language)
            
            db.session.commit()
            flash('Profile updated successfully!', 'success')
        except Exception as e:
            db.session.rollback()
            flash('Error updating profile.', 'danger')
            print(f"Profile update error: {e}")
        
        return redirect(url_for('dashboard.profile'))
    
    return render_template('dashboard/profile.html')
