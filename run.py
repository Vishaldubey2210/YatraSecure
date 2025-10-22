#!/usr/bin/env python3
"""
YatraSecure - Production Runner
Supports both Flask and SocketIO modes
"""

import os
from app import create_app

def main():
    """Main application runner"""
    print("🚀 Starting YatraSecure...")
    
    # Get environment
    config_name = os.getenv('FLASK_ENV', 'development')
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    # Create app
    app, socketio_instance, blueprints = create_app(config_name)
    
    print(f"\n{'='*60}")
    print(f"🎯 YatraSecure Server Starting")
    print(f"{'='*60}")
    print(f"🌐 Environment: {config_name}")
    print(f"🏠 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"📦 Blueprints: {len(blueprints)} loaded")
    print(f"{'='*60}\n")
    
    # Run with SocketIO if available (for real-time chat)
    if socketio_instance and 'chat' in blueprints:
        print("🔌 Running with SocketIO (Real-time features enabled)")
        socketio_instance.run(
            app,
            debug=(config_name == 'development'),
            host=host,
            port=port,
            use_reloader=False
        )
    else:
        print("📡 Running with Flask only")
        app.run(
            debug=(config_name == 'development'),
            host=host,
            port=port,
            use_reloader=False
        )


if __name__ == '__main__':
    main()
