"""
YatraSecure - Main Application Factory
PRODUCTION VERSION for Railway Deployment
"""

from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO
import os
import traceback
from config import config
from extensions import db, login_manager, bcrypt

# Global SocketIO instance
socketio = None

def create_app(config_name=None):
    """Application factory function"""
    global socketio
    
    # Get config from environment
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'production')
    
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
        try:
            os.makedirs(directory, exist_ok=True)
        except:
            pass
    
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
        
        # Create tables if they don't exist
        try:
            db.create_all()
            print("✅ Database tables ready")
        except Exception as e:
            print(f"⚠️  Database creation warning: {e}")
    
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
    
    # Startup info
    print(f"\n{'='*60}")
    print(f"🚀 YatraSecure Application Created")
    print(f"{'='*60}")
    print(f"📦 Blueprints: {len(blueprints_registered)} registered")
    print(f"   {', '.join(blueprints_registered)}")
    print(f"🔧 Config: {config_name}")
    print(f"💾 Database: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not configured')[:50]}...")
    print(f"{'='*60}\n")
    
    return app


# Fallback HTML renderers
def render_fallback_404():
    """Fallback 404 page"""
    return """<!DOCTYPE html><html><head><title>404 - Not Found</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh;display:flex;align-items:center}
    .error-container{text-align:center;max-width:600px;margin:0 auto;padding:40px}</style>
    </head><body><div class="error-container"><h1 style="font-size:5rem">🔍</h1><h2>404 - Page Not Found</h2>
    <p class="lead">The page you're looking for doesn't exist.</p>
    <a href="/" class="btn btn-light">🏠 Go Home</a></div></body></html>"""

def render_fallback_500():
    """Fallback 500 page"""
    return """<!DOCTYPE html><html><head><title>500 - Server Error</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>body{background:linear-gradient(135deg,#ff4757 0%,#ee5a6f 100%);color:white;min-height:100vh;display:flex;align-items:center}
    .error-container{text-align:center;max-width:600px;margin:0 auto;padding:40px}</style>
    </head><body><div class="error-container"><h1 style="font-size:5rem">⚠️</h1><h2>500 - Server Error</h2>
    <p class="lead">Something went wrong. Please try again later.</p>
    <a href="/" class="btn btn-light">🏠 Go Home</a></div></body></html>"""

def render_fallback_home(blueprints):
    """Fallback home page"""
    return f"""<!DOCTYPE html><html><head><title>YatraSecure - Safe Travel Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>body{{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh}}
    .hero{{text-align:center;max-width:900px;margin:0 auto;padding:100px 40px}}
    .hero h1{{font-size:4.5rem;margin-bottom:20px;font-weight:800}}</style>
    </head><body><div class="hero"><h1>🛡️ YatraSecure</h1>
    <p style="font-size:1.5rem;margin-bottom:50px">Your intelligent companion for safe travel across India</p>
    <a href='/auth/login' class='btn btn-light btn-lg mx-2'>Login</a>
    <a href='/auth/signup' class='btn btn-outline-light btn-lg mx-2'>Sign Up</a>
    <div class="mt-5"><small>Active: {', '.join(blueprints)}</small></div>
    </div></body></html>"""


# ✅ FIXED: Export app instance for gunicorn
app = create_app()

# Run application
if __name__ == '__main__':
    print("⚠️  For production, use: gunicorn run:app\n")
    app.run(debug=False, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
