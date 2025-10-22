"""
Database Cleanup and Initialization
"""

from app import create_app
from extensions import db
import os

def cleanup_and_init():
    """Clean and initialize database"""
    
    app, _, _ = create_app()
    
    with app.app_context():
        try:
            # Remove old database
            db_path = 'yatra.db'
            if os.path.exists(db_path):
                os.remove(db_path)
                print("🗑️  Removed old database")
            
            # Create new tables
            db.create_all()
            print("✅ Database initialized successfully!")
            
            # Show created tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"\n📊 Created {len(tables)} tables:")
            for table in sorted(tables):
                print(f"   ✓ {table}")
            
            # Create sample admin user
            from models.user import User
            from extensions import bcrypt
            
            admin = User(
                email='admin@yatrasecure.com',
                password_hash=bcrypt.generate_password_hash('Admin@123').decode('utf-8'),
                full_name='Admin User',
                phone='9999999999',
                is_premium=True,
                premium_plan='enterprise'
            )
            
            db.session.add(admin)
            db.session.commit()
            print("\n👤 Admin user created:")
            print("   📧 Email: admin@yatrasecure.com")
            print("   🔐 Password: Admin@123")
            
            # Create sample regular user
            user = User(
                email='test@user.com',
                password_hash=bcrypt.generate_password_hash('Test@123').decode('utf-8'),
                full_name='Test User',
                phone='8888888888'
            )
            
            db.session.add(user)
            db.session.commit()
            print("\n👤 Test user created:")
            print("   📧 Email: test@user.com")
            print("   🔐 Password: Test@123")
            
            print("\n✅ Database setup complete!")
            
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            import traceback
            traceback.print_exc()


if __name__ == '__main__':
    cleanup_and_init()
