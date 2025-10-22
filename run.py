"""
Production-ready entry point for YatraSecure
Use with: gunicorn run:app
"""

from app import create_app
import os

# ✅ Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    # For local development
    port = int(os.getenv('PORT', 5000))
    app.run(
        debug=False,
        host='0.0.0.0',
        port=port
    )
