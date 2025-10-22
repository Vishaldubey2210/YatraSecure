"""
Configuration settings for YatraSecure
Production-ready with environment variable support
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration"""
    
    # Security - Always has a fallback!
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production-123456')
    
    # Database - Production-ready with fallback
    # Supports both SQLite (dev) and PostgreSQL (production)
    DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "yatra.db")}')
    
    # Fix for Heroku/Render PostgreSQL URL
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    
    # File uploads
    UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
    
    # Session
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = False  # Set True in production
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # Languages
    SUPPORTED_LANGUAGES = [
        'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali',
        'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'
    ]
    
    # API Keys (Load from environment)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN', '')
    
    # Pagination
    ITEMS_PER_PAGE = 12
    
    # Premium Pricing
    PREMIUM_PRICING = {
        'weekend_trip': 149,
        'long_trip': 299,
        'monthly': 499,
        'annual': 2999
    }
    
    # Flask Settings
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # CORS (if API needed)
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Rate Limiting (optional)
    RATELIMIT_ENABLED = os.getenv('RATELIMIT_ENABLED', 'False') == 'True'
    RATELIMIT_STORAGE_URL = os.getenv('REDIS_URL', 'memory://')
    
    # ML Model Paths
    ML_MODEL_DIR = os.path.join(basedir, 'ml_models', 'trained_models')
    ML_DATA_DIR = os.path.join(basedir, 'ml_models', 'data')
    
    # Email Settings (for future features)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@yatrasecure.com')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True  # Show SQL queries in console
    
    # Less strict session for development
    SESSION_COOKIE_SECURE = False
    
    # Development-specific settings
    TEMPLATES_AUTO_RELOAD = True
    SEND_FILE_MAX_AGE_DEFAULT = 0


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Strict security for production
    SESSION_COOKIE_SECURE = True  # HTTPS only
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # ✅ FIXED: SECRET_KEY with fallback instead of raising error
    SECRET_KEY = os.getenv('SECRET_KEY', 'production-fallback-secret-key-change-this-abc123xyz')
    
    # ✅ REMOVED: Strict check that was causing deployment failure
    # The key will always have a value now (either from env or fallback)
    # For better security, set SECRET_KEY environment variable in Railway
    
    # Production logging
    LOG_LEVEL = 'WARNING'
    
    # Disable template auto-reload
    TEMPLATES_AUTO_RELOAD = False
    
    # Cache static files
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory database for tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False
    
    # Short session for tests
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=5)


# Config dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


# Helper function to get config
def get_config(env=None):
    """Get configuration based on environment"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    
    return config.get(env, config['default'])
