"""
Database initialization script
Creates all tables and sets up the database schema
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from sqlalchemy import text

def init_database():
    """Initialize the database with all tables"""
    app = create_app()
    
    with app.app_context():
        # Drop all tables (use with caution in production!)
        print("Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating tables...")
        db.create_all()
        
        # Create indexes for better performance
        print("Creating indexes...")
        create_indexes()
        
        print("✅ Database initialized successfully!")
        print(f"Database location: {app.config['SQLALCHEMY_DATABASE_URI']}")

def create_indexes():
    """Create indexes for frequently queried columns"""
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);",
        "CREATE INDEX IF NOT EXISTS idx_trips_admin ON trips(admin_user_id);",
        "CREATE INDEX IF NOT EXISTS idx_trips_join_code ON trips(join_code);",
        "CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON trip_members(trip_id);",
        "CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_safety_zones_city ON safety_zones(city);",
        "CREATE INDEX IF NOT EXISTS idx_safety_scores_location ON safety_scores(location_name);",
        "CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);",
        "CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);",
        "CREATE INDEX IF NOT EXISTS idx_alerts_location ON alerts(location);",
        "CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);",
    ]
    
    for index_sql in indexes:
        try:
            db.session.execute(text(index_sql))
        except Exception as e:
            print(f"Warning: Could not create index - {e}")
    
    db.session.commit()

if __name__ == '__main__':
    init_database()
