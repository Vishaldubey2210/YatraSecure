"""
Django settings for YatraSecure project.
Supports both development and production environments.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-yatrasecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Allowed hosts
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    # Default Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Project apps
    'apps.accounts',
    'apps.trips',
    'apps.expenses',
    'apps.safety',
    'apps.ai_assistant',
    'apps.gallery',
    'apps.chat',
    'apps.community',
    'apps.dashboard',
    'apps.explore',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# Default: SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Authentication URLs
LOGIN_URL = 'accounts:login'
LOGIN_REDIRECT_URL = 'dashboard:home'
LOGOUT_REDIRECT_URL = 'dashboard:landing'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True

# API Keys from environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

# Debugging info (development only)
if DEBUG:
    if GEMINI_API_KEY:
        print(f"✅ Gemini API Key loaded: {GEMINI_API_KEY[:20]}...")
    else:
        print("⚠️ Warning: GEMINI_API_KEY not found in environment")


# ============================================================================
# PRODUCTION SETTINGS (Render.com / Any Production Environment)
# ============================================================================

if not DEBUG:
    print("🚀 Loading production settings...")
    
    # Security Settings
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS Settings
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Database Configuration
    # Render provides DATABASE_URL environment variable
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Use PostgreSQL from Render
        DATABASES['default'] = dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
        print("✅ PostgreSQL database configured")
    else:
        print("⚠️ No DATABASE_URL found, using SQLite")
    
    # Static Files with WhiteNoise
    # WhiteNoise must be AFTER SecurityMiddleware but BEFORE all others
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    
    # Static files storage
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # CSRF Trusted Origins
    # Add your Render URL here
    render_url = os.environ.get('RENDER_EXTERNAL_URL', '')
    if render_url:
        CSRF_TRUSTED_ORIGINS = [
            f'https://{render_url}',
            render_url if render_url.startswith('http') else f'https://{render_url}'
        ]
    
    # Allowed Hosts
    # Parse from environment variable
    allowed_hosts = os.environ.get('ALLOWED_HOSTS', '')
    if allowed_hosts:
        ALLOWED_HOSTS = [host.strip() for host in allowed_hosts.split(',')]
    
    # Additional Render-specific settings
    RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
    if RENDER_EXTERNAL_HOSTNAME:
        ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    
    print(f"✅ Production settings loaded")
    print(f"   Allowed Hosts: {ALLOWED_HOSTS}")
    print(f"   Database: PostgreSQL")
    print(f"   Static: WhiteNoise")


# ============================================================================
# LOGGING (Optional but recommended for production)
# ============================================================================

if not DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': False,
            },
        },
    }
