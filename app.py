"""
YatraSecure - Main Application Factory
FINAL PRODUCTION VERSION - Complete with All Features
Enhanced with Pool Wallet, Chat, Booking Aggregator
"""

from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO
import os
import traceback
from config import config
from extensions import db, login_manager, bcrypt

# Global SocketIO instance
socketio = None

def create_app(config_name='development'):
    """Application factory function"""
    global socketio
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Create required directories
    directories = [
        'static/uploads',
        'static/uploads/chat',
        'static/images',
        'logs',
        'templates/trip',
        'templates/errors',
        'templates/safety',
        'templates/booking',
        'templates/chat',
        'templates/wallet'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    
    # Initialize SocketIO for real-time features
    try:
        socketio = SocketIO(
            app, 
            cors_allowed_origins="*", 
            async_mode='threading',
            logger=False,
            engineio_logger=False
        )
        print("✅ SocketIO initialized")
    except Exception as e:
        print(f"⚠️  SocketIO initialization failed: {e}")
        socketio = None
    
    # Login manager configuration
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    # Import models
    with app.app_context():
        try:
            from models import user, trip, booking
            print("✅ Models imported successfully")
        except Exception as e:
            print(f"⚠️  Model import warning: {e}")
            if config_name == 'development':
                traceback.print_exc()
    
    # Register blueprints
    blueprints_registered = []
    
    # Core blueprints
    core_blueprints = [
        ('routes.auth', 'auth_bp', '/auth', 'auth'),
        ('routes.dashboard', 'dashboard_bp', '/dashboard', 'dashboard'),
        ('routes.trip', 'trip_bp', '/trip', 'trip'),
        ('routes.booking', 'booking_bp', '/booking', 'booking'),
        ('routes.safety', 'safety_bp', '/safety', 'safety'),
        ('routes.provider', 'provider_bp', '/provider', 'provider'),
        ('routes.api', 'api_bp', '/api', 'api'),
    ]
    
    for module_name, bp_name, url_prefix, display_name in core_blueprints:
        try:
            module = __import__(module_name, fromlist=[bp_name])
            blueprint = getattr(module, bp_name)
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            blueprints_registered.append(display_name)
            print(f"✅ {display_name.capitalize()} blueprint registered")
        except Exception as e:
            print(f"❌ {display_name.capitalize()} blueprint failed: {e}")
            if config_name == 'development':
                traceback.print_exc()
    
    # Optional advanced features
    advanced_blueprints = [
        ('routes.ai_itinerary', 'ai_bp', '/ai', 'ai-itinerary'),
        ('routes.chat', 'chat_bp', '/chat', 'chat'),
        ('routes.wallet', 'wallet_bp', '/wallet', 'wallet'),
        ('routes.booking_aggregator', 'aggregator_bp', '/aggregator', 'booking-aggregator'),
        ('routes.ai_agent', 'ai_agent_bp', '/ai-agent', 'ai-agent'),
    ]
    
    for module_name, bp_name, url_prefix, display_name in advanced_blueprints:
        try:
            module = __import__(module_name, fromlist=[bp_name])
            blueprint = getattr(module, bp_name)
            app.register_blueprint(blueprint, url_prefix=url_prefix)
            blueprints_registered.append(display_name)
            print(f"✅ {display_name.capitalize()} blueprint registered")
        except Exception as e:
            print(f"⚠️  {display_name.capitalize()} blueprint not available: {e}")
    
    # Initialize SocketIO events
    if socketio:
        try:
            from routes.chat import init_socketio
            init_socketio(socketio)
            print("✅ SocketIO events initialized")
        except Exception as e:
            print(f"⚠️  SocketIO events initialization failed: {e}")
    
    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        try:
            return render_template('errors/404.html'), 404
        except:
            return render_fallback_404(), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        print(f"❌ 500 Error: {e}")
        if config_name == 'development':
            traceback.print_exc()
        try:
            return render_template('errors/500.html'), 500
        except:
            return render_fallback_500(), 500
    
    # Home route
    @app.route('/')
    def index():
        try:
            return render_template('index.html')
        except:
            return render_fallback_home(blueprints_registered)
    
    # User loader
    @login_manager.user_loader
    def load_user(user_id):
        try:
            from models.user import User
            return User.query.get(int(user_id))
        except Exception as e:
            print(f"❌ User loader error: {e}")
            return None
    
    # Template filters
    @app.template_filter('currency')
    def format_currency(value):
        try:
            return f"₹{value:,.2f}"
        except:
            return f"₹{value}"
    
    @app.template_filter('datetime')
    def format_datetime(value, format='%d %b %Y, %I:%M %p'):
        if value is None:
            return ""
        try:
            return value.strftime(format)
        except:
            return str(value)
    
    @app.template_filter('date')
    def format_date(value, format='%d %b %Y'):
        if value is None:
            return ""
        try:
            return value.strftime(format)
        except:
            return str(value)
    
    @app.template_filter('time_ago')
    def time_ago(value):
        """Show relative time"""
        if not value:
            return ""
        try:
            from datetime import datetime
            now = datetime.now()
            diff = now - value
            
            if diff.days > 0:
                return f"{diff.days} days ago"
            elif diff.seconds > 3600:
                return f"{diff.seconds // 3600} hours ago"
            elif diff.seconds > 60:
                return f"{diff.seconds // 60} minutes ago"
            else:
                return "Just now"
        except:
            return str(value)
    
    # Context processor
    @app.context_processor
    def inject_globals():
        return {
            'app_name': 'YatraSecure',
            'supported_languages': app.config.get('SUPPORTED_LANGUAGES', ['English']),
            'current_year': 2025,
            'blueprints_enabled': blueprints_registered
        }
    
    # CLI commands
    @app.cli.command()
    def init_db():
        """Initialize database"""
        db.create_all()
        print("✅ Database initialized!")
    
    @app.cli.command()
    def create_admin():
        """Create admin user"""
        from models.user import User
        admin = User(
            email='admin@yatrasecure.com',
            full_name='Admin User',
            password_hash=bcrypt.generate_password_hash('Admin@123').decode('utf-8')
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created!")
        print("   📧 Email: admin@yatrasecure.com")
        print("   🔐 Password: Admin@123")
    
    # Startup info
    print(f"\n{'='*60}")
    print(f"🚀 YatraSecure Application Created")
    print(f"{'='*60}")
    print(f"📦 Blueprints: {len(blueprints_registered)} registered")
    print(f"   {', '.join(blueprints_registered)}")
    print(f"🔧 Config: {config_name}")
    print(f"💾 Database: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not configured')[:50]}...")
    print(f"{'='*60}")
    print(f"✨ Features Available:")
    print(f"   • AI Trip Planner with Gemini")
    print(f"   • Real-time Group Chat (@yatra AI)")
    print(f"   • Pool Wallet System")
    print(f"   • Hotel/Flight/Train Booking")
    print(f"   • Safety Alerts & Maps")
    print(f"   • Expense Tracking")
    print(f"{'='*60}\n")
    
    return app, socketio, blueprints_registered


# Fallback HTML renderers
def render_fallback_404():
    """Fallback 404 page"""
    return """<!DOCTYPE html><html><head><title>404 - Not Found</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh;display:flex;align-items:center}
    .error-container{text-align:center;max-width:600px;margin:0 auto;padding:40px}
    .btn{padding:15px 30px;border-radius:12px;font-weight:600;margin:10px;text-decoration:none;display:inline-block}</style>
    </head><body><div class="error-container"><h1 style="font-size:5rem">🔍</h1><h2>404 - Page Not Found</h2>
    <p class="lead">The page you're looking for doesn't exist.</p>
    <a href="/" class="btn btn-light">🏠 Go Home</a><a href="/dashboard/user" class="btn btn-outline-light">📊 Dashboard</a>
    </div></body></html>"""

def render_fallback_500():
    """Fallback 500 page"""
    return """<!DOCTYPE html><html><head><title>500 - Server Error</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>body{background:linear-gradient(135deg,#ff4757 0%,#ee5a6f 100%);color:white;min-height:100vh;display:flex;align-items:center}
    .error-container{text-align:center;max-width:600px;margin:0 auto;padding:40px}
    .btn{padding:15px 30px;border-radius:12px;font-weight:600;margin:10px;text-decoration:none;display:inline-block}</style>
    </head><body><div class="error-container"><h1 style="font-size:5rem">⚠️</h1><h2>500 - Server Error</h2>
    <p class="lead">Something went wrong. Please try again later.</p>
    <a href="/" class="btn btn-light">🏠 Go Home</a><a href="javascript:history.back()" class="btn btn-outline-light">← Go Back</a>
    </div></body></html>"""

def render_fallback_home(blueprints):
    """Fallback home page"""
    return f"""<!DOCTYPE html><html><head><title>YatraSecure - Safe Travel Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <style>body{{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh;font-family:-apple-system,sans-serif}}
    .hero{{text-align:center;max-width:900px;margin:0 auto;padding:100px 40px}}
    .hero h1{{font-size:4.5rem;margin-bottom:20px;font-weight:800;text-shadow:0 4px 20px rgba(0,0,0,0.2)}}
    .btn{{padding:18px 45px;font-size:1.3rem;margin:15px;border-radius:15px;font-weight:700;text-decoration:none;transition:all 0.3s;display:inline-block}}
    .btn:hover{{transform:translateY(-5px);box-shadow:0 8px 25px rgba(0,0,0,0.3)}}
    .btn-light{{background:white;color:#667eea}}
    .btn-outline-light{{border:3px solid rgba(255,255,255,0.8);color:white;background:transparent}}
    .features{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:30px;margin-top:80px}}
    .feature{{text-align:center;padding:30px;background:rgba(255,255,255,0.1);border-radius:20px}}
    .feature i{{font-size:3rem;margin-bottom:15px}}</style>
    </head><body><div class="hero"><h1>🛡️ YatraSecure</h1>
    <p style="font-size:1.5rem;margin-bottom:50px">Your intelligent companion for safe travel across India<br>
    <small style="opacity:0.9">✨ AI-powered • 💬 Real-time chat • 💰 Pool wallet • 🏨 Smart booking</small></p>
    <div><a href='/auth/login' class='btn btn-light'><i class="bi bi-box-arrow-in-right"></i> Login</a>
    <a href='/auth/signup' class='btn btn-outline-light'><i class="bi bi-person-plus"></i> Sign Up Free</a></div>
    <div class="features">
    <div class="feature"><i class="bi bi-robot"></i><h5>AI Assistant</h5><small>Smart trip planning</small></div>
    <div class="feature"><i class="bi bi-shield-check"></i><h5>Real-time Safety</h5><small>Live alerts & maps</small></div>
    <div class="feature"><i class="bi bi-people"></i><h5>Group Travel</h5><small>Chat & split expenses</small></div>
    <div class="feature"><i class="bi bi-wallet2"></i><h5>Pool Wallet</h5><small>Shared payments</small></div>
    <div class="feature"><i class="bi bi-cart-check"></i><h5>Smart Booking</h5><small>Best deals aggregated</small></div>
    <div class="feature"><i class="bi bi-geo-alt"></i><h5>Location Sharing</h5><small>Track group members</small></div>
    </div></div>
    <div class="text-center py-5" style="border-top:2px solid rgba(255,255,255,0.2);margin-top:100px">
    <p style="opacity:0.8">📦 Active Modules: {', '.join(blueprints)}</p></div></body></html>"""


# Run application
if __name__ == '__main__':
    print("⚠️  Tip: Use 'python run.py' for better startup!\n")
    
    app, socketio_instance, blueprints = create_app()
    
    if socketio_instance:
        print("🔌 Starting with SocketIO support...")
        socketio_instance.run(app, debug=True, host='0.0.0.0', port=5000)
    else:
        print("📡 Starting without SocketIO...")
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
