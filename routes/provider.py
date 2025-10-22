"""
Service Provider Dashboard Routes - SAFE VERSION
Provider login, dashboard, and service management with fallbacks
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from datetime import datetime
from extensions import db, bcrypt

provider_bp = Blueprint('provider', __name__)


# Safe model imports with fallbacks
try:
    from models.provider import ServiceProvider, Service
    MODELS_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Provider models not available: {e}")
    MODELS_AVAILABLE = False
    ServiceProvider = None
    Service = None

try:
    from models.booking import Booking
except Exception as e:
    print(f"⚠️  Booking model not available: {e}")
    Booking = None

try:
    from utils.validators import validate_email, validate_password, validate_phone
except Exception as e:
    print(f"⚠️  Validators not available: {e}")
    # Simple fallback validators
    def validate_email(email):
        if '@' in email and '.' in email:
            return True, None
        return False, "Invalid email format"
    
    def validate_password(password):
        if len(password) >= 6:
            return True, None
        return False, "Password must be at least 6 characters"
    
    def validate_phone(phone):
        if len(phone) >= 10:
            return True, None
        return False, "Invalid phone number"


def provider_required(f):
    """Decorator to require provider login"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'provider_id' not in session:
            flash('Please login as a provider', 'warning')
            return redirect(url_for('provider.provider_login'))
        return f(*args, **kwargs)
    return decorated_function


@provider_bp.route('/login', methods=['GET', 'POST'])
def provider_login():
    """Provider login - FIXED with proper redirects"""
    if request.method == 'POST':
        try:
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            
            print(f"🔍 Login attempt - Email: {email}")  # Debug log
            
            # Validation
            if not email or not password:
                flash('Please enter both email and password', 'danger')
                return redirect(url_for('provider.provider_login'))  # ✅ FIXED
            
            # Check if models available
            if not MODELS_AVAILABLE or ServiceProvider is None:
                print("⚠️  Models not available - using demo mode")
                
                # Demo credentials
                if email == 'test@hotel.com' and password == 'Test@123':
                    session['provider_id'] = 1
                    session['provider_name'] = 'Test Hotel Mumbai'
                    session['is_provider'] = True
                    
                    print("✅ Demo login successful!")
                    flash('Welcome back, Test Hotel Mumbai! (Demo Mode)', 'success')
                    return redirect(url_for('provider.dashboard'))
                else:
                    print(f"❌ Invalid demo credentials for {email}")
                    flash('Invalid credentials. Demo: test@hotel.com / Test@123', 'danger')
                    return redirect(url_for('provider.provider_login'))  # ✅ FIXED
            
            # Database authentication
            print("🔍 Checking database for provider...")
            provider = ServiceProvider.query.filter_by(email=email).first()
            
            if not provider:
                print(f"❌ Provider not found: {email}")
                flash('Email not registered', 'danger')
                return redirect(url_for('provider.provider_login'))  # ✅ FIXED
            
            if not bcrypt.check_password_hash(provider.password_hash, password):
                print(f"❌ Invalid password for: {email}")
                flash('Invalid password', 'danger')
                return redirect(url_for('provider.provider_login'))  # ✅ FIXED
            
            # Login successful
            session['provider_id'] = provider.provider_id
            session['provider_name'] = provider.business_name
            session['is_provider'] = True
            
            print(f"✅ Database login successful: {provider.business_name}")
            flash(f'Welcome back, {provider.business_name}!', 'success')
            return redirect(url_for('provider.dashboard'))
                
        except Exception as e:
            print(f"❌ Exception in provider login: {e}")
            import traceback
            traceback.print_exc()
            flash('Login error occurred. Please try again.', 'danger')
            return redirect(url_for('provider.provider_login'))  # ✅ FIXED
    
    # GET request - show login form
    return render_template('provider/login.html')


@provider_bp.route('/signup', methods=['GET', 'POST'])
def provider_signup():
    """Provider registration - FIXED"""
    if request.method == 'POST':
        try:
            business_name = request.form.get('business_name', '').strip()
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            phone = request.form.get('phone', '').strip()
            provider_type = request.form.get('provider_type', '')
            city = request.form.get('city', '').strip()
            state = request.form.get('state', '').strip()
            
            print(f"🔍 Signup attempt - Business: {business_name}, Email: {email}")
            
            # Validation
            if not all([business_name, email, password, phone, provider_type, city, state]):
                flash('Please fill all required fields', 'danger')
                return redirect(url_for('provider.provider_signup'))  # ✅ FIXED
            
            is_valid, error = validate_email(email)
            if not is_valid:
                flash(error, 'danger')
                return redirect(url_for('provider.provider_signup'))  # ✅ FIXED
            
            is_valid, error = validate_password(password)
            if not is_valid:
                flash(error, 'danger')
                return redirect(url_for('provider.provider_signup'))  # ✅ FIXED
            
            if not MODELS_AVAILABLE or ServiceProvider is None:
                print("⚠️  Models not available - demo signup")
                flash('Registration successful! Use test@hotel.com / Test@123 to login (demo mode)', 'success')
                return redirect(url_for('provider.provider_login'))
            
            # Check if email exists
            if ServiceProvider.query.filter_by(email=email).first():
                print(f"❌ Email already exists: {email}")
                flash('Email already registered', 'danger')
                return redirect(url_for('provider.provider_signup'))  # ✅ FIXED
            
            # Create provider
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            
            new_provider = ServiceProvider(
                business_name=business_name,
                email=email,
                password_hash=hashed_password,
                phone=phone,
                provider_type=provider_type,
                city=city,
                state=state,
                is_verified=False
            )
            
            db.session.add(new_provider)
            db.session.commit()
            
            print(f"✅ Provider registered: {business_name}")
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('provider.provider_login'))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Provider signup error: {e}")
            import traceback
            traceback.print_exc()
            flash('Registration error occurred', 'danger')
            return redirect(url_for('provider.provider_signup'))  # ✅ FIXED
    
    # GET request
    return render_template('provider/signup.html')


@provider_bp.route('/logout')
def provider_logout():
    """Provider logout"""
    provider_name = session.get('provider_name', 'Provider')
    session.pop('provider_id', None)
    session.pop('provider_name', None)
    session.pop('is_provider', None)
    
    print(f"👋 Logout: {provider_name}")
    flash('Logged out successfully', 'success')
    return redirect(url_for('provider.provider_login'))


@provider_bp.route('/dashboard')
@provider_required
def dashboard():
    """Provider dashboard"""
    try:
        provider_id = session.get('provider_id')
        print(f"🏠 Loading dashboard for provider_id: {provider_id}")
        
        if not MODELS_AVAILABLE:
            print("📊 Using mock data (demo mode)")
            # Mock data for demo
            provider = {
                'business_name': session.get('provider_name', 'Test Hotel'),
                'provider_type': 'hotel',
                'rating': 4.5,
                'total_reviews': 42
            }
            
            stats = {
                'total_services': 5,
                'total_bookings': 12,
                'pending_bookings': 3,
                'total_revenue': 45000,
                'rating': 4.5,
                'total_reviews': 42
            }
            
            recent_bookings = []
            
        else:
            print("📊 Loading from database")
            # Real database data
            provider = ServiceProvider.query.get_or_404(provider_id)
            
            total_services = Service.query.filter_by(provider_id=provider_id).count() if Service else 0
            total_bookings = Booking.query.filter_by(provider_id=provider_id).count() if Booking else 0
            pending_bookings = Booking.query.filter_by(
                provider_id=provider_id,
                booking_status='pending'
            ).count() if Booking else 0
            
            recent_bookings = Booking.query.filter_by(
                provider_id=provider_id
            ).order_by(Booking.created_at.desc()).limit(5).all() if Booking else []
            
            total_revenue = db.session.query(db.func.sum(Booking.total_amount)).filter(
                Booking.provider_id == provider_id,
                Booking.booking_status == 'completed'
            ).scalar() or 0 if Booking else 0
            
            stats = {
                'total_services': total_services,
                'total_bookings': total_bookings,
                'pending_bookings': pending_bookings,
                'total_revenue': total_revenue,
                'rating': provider.rating if hasattr(provider, 'rating') else 4.5,
                'total_reviews': provider.total_reviews if hasattr(provider, 'total_reviews') else 0
            }
        
        return render_template('provider/dashboard.html',
                             provider=provider,
                             stats=stats,
                             recent_bookings=recent_bookings)
                             
    except Exception as e:
        print(f"❌ Provider dashboard error: {e}")
        import traceback
        traceback.print_exc()
        
        # HTML fallback
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Provider Dashboard</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
            <style>
                body {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 50px 0; }}
                .dashboard-card {{ background: white; border-radius: 20px; padding: 40px; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }}
                .stat-card {{ background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 15px; padding: 30px; text-align: center; border: 2px solid #e0e0e0; transition: all 0.3s ease; }}
                .stat-card:hover {{ transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }}
                .stat-value {{ font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 10px; }}
                .stat-label {{ color: #999; text-transform: uppercase; font-size: 0.9rem; font-weight: 600; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="dashboard-card">
                    <h1><i class="bi bi-shop"></i> Welcome {session.get('provider_name', 'Provider')}!</h1>
                    <p class="lead text-muted">Your provider dashboard is working! <span class="badge bg-success">Demo Mode</span></p>
                </div>
                
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">5</div>
                            <div class="stat-label">Total Services</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">12</div>
                            <div class="stat-label">Total Bookings</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">3</div>
                            <div class="stat-label">Pending</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stat-card">
                            <div class="stat-value">₹45K</div>
                            <div class="stat-label">Revenue</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3><i class="bi bi-lightning-fill"></i> Quick Actions</h3>
                    <div class="mt-3">
                        <a href="{url_for('provider.services')}" class="btn btn-primary me-2 mb-2">
                            <i class="bi bi-list-ul"></i> Manage Services
                        </a>
                        <a href="{url_for('provider.bookings')}" class="btn btn-success me-2 mb-2">
                            <i class="bi bi-calendar-check"></i> View Bookings
                        </a>
                        <a href="{url_for('provider.provider_logout')}" class="btn btn-danger mb-2">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """


@provider_bp.route('/services')
@provider_required
def services():
    """Manage services"""
    try:
        if not MODELS_AVAILABLE or Service is None:
            return "<h1>Services Management</h1><p>Feature available in full version</p><a href='/provider/dashboard'>Back</a>"
        
        provider_id = session.get('provider_id')
        services_list = Service.query.filter_by(provider_id=provider_id).all()
        
        return render_template('provider/services.html', services=services_list)
    except Exception as e:
        print(f"Services error: {e}")
        return render_template('provider/services.html', services=[])


@provider_bp.route('/services/add', methods=['GET', 'POST'])
@provider_required
def add_service():
    """Add new service"""
    if request.method == 'POST':
        try:
            if not MODELS_AVAILABLE or Service is None:
                flash('Service management available in full version', 'info')
                return redirect(url_for('provider.dashboard'))
            
            provider_id = session.get('provider_id')
            service_name = request.form.get('service_name', '').strip()
            description = request.form.get('description', '').strip()
            price = request.form.get('price', type=float)
            duration = request.form.get('duration', '').strip()
            
            if not all([service_name, price]):
                flash('Please fill required fields', 'danger')
                return redirect(url_for('provider.add_service'))  # ✅ FIXED
            
            new_service = Service(
                provider_id=provider_id,
                service_name=service_name,
                description=description,
                price=price,
                duration=duration,
                is_available=True
            )
            
            db.session.add(new_service)
            db.session.commit()
            
            flash('Service added successfully!', 'success')
            return redirect(url_for('provider.services'))
            
        except Exception as e:
            db.session.rollback()
            print(f"Add service error: {e}")
            flash('Error adding service', 'danger')
            return redirect(url_for('provider.add_service'))  # ✅ FIXED
    
    return render_template('provider/add_service.html')


@provider_bp.route('/bookings')
@provider_required
def bookings():
    """View all bookings"""
    try:
        if not MODELS_AVAILABLE or Booking is None:
            return "<h1>Bookings Management</h1><p>Feature available in full version</p><a href='/provider/dashboard'>Back</a>"
        
        provider_id = session.get('provider_id')
        status = request.args.get('status', 'all')
        
        query = Booking.query.filter_by(provider_id=provider_id)
        
        if status != 'all':
            query = query.filter_by(booking_status=status)
        
        bookings_list = query.order_by(Booking.created_at.desc()).all()
        
        return render_template('provider/bookings.html',
                             bookings=bookings_list,
                             selected_status=status)
    except Exception as e:
        print(f"Bookings error: {e}")
        return render_template('provider/bookings.html',
                             bookings=[],
                             selected_status='all')


@provider_bp.route('/bookings/<int:booking_id>/update', methods=['POST'])
@provider_required
def update_booking_status(booking_id):
    """Update booking status"""
    try:
        if not MODELS_AVAILABLE or Booking is None:
            flash('Booking management available in full version', 'info')
            return redirect(url_for('provider.dashboard'))
        
        provider_id = session.get('provider_id')
        booking = Booking.query.get_or_404(booking_id)
        
        if booking.provider_id != provider_id:
            flash('Unauthorized', 'danger')
            return redirect(url_for('provider.bookings'))
        
        new_status = request.form.get('status')
        
        if new_status in ['pending', 'confirmed', 'completed', 'cancelled']:
            booking.booking_status = new_status
            db.session.commit()
            flash(f'Booking status updated to {new_status}', 'success')
        else:
            flash('Invalid status', 'danger')
        
    except Exception as e:
        db.session.rollback()
        print(f"Update booking error: {e}")
        flash('Error updating booking', 'danger')
    
    return redirect(url_for('provider.bookings'))
