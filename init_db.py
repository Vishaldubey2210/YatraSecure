"""
Database Initialization Script
Creates dummy users for testing on Railway
Run once after deployment to populate database
"""

from app import create_app
from extensions import db, bcrypt
from models.user import User
from datetime import datetime

def init_database():
    """Initialize database with dummy users"""
    
    print("🚀 Starting database initialization...")
    
    # Create app
    app = create_app()
    
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created")
            
            # Check if users already exist
            existing_users = User.query.count()
            if existing_users > 0:
                print(f"⚠️  Database already has {existing_users} users. Skipping initialization.")
                return
            
            # Create dummy users
            dummy_users = [
                {
                    'email': 'demo@yatrasecure.com',
                    'password': 'Demo@123',
                    'full_name': 'Demo User',
                    'phone': '9876543210',
                    'is_premium': False
                },
                {
                    'email': 'test@test.com',
                    'password': 'Test@123',
                    'full_name': 'Test User',
                    'phone': '8765432109',
                    'is_premium': False
                },
                {
                    'email': 'admin@yatrasecure.com',
                    'password': 'Admin@123',
                    'full_name': 'Admin User',
                    'phone': '7654321098',
                    'is_premium': True,
                    'premium_plan': 'annual'
                }
            ]
            
            print(f"\n👤 Creating {len(dummy_users)} dummy users...")
            
            created_users = []
            for user_data in dummy_users:
                # Hash password
                password_hash = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
                
                # Create user
                user = User(
                    email=user_data['email'],
                    password_hash=password_hash,
                    full_name=user_data['full_name'],
                    phone=user_data.get('phone'),
                    is_premium=user_data.get('is_premium', False),
                    premium_plan=user_data.get('premium_plan'),
                    created_at=datetime.now()
                )
                
                db.session.add(user)
                created_users.append(user_data)
                print(f"   ✓ Created: {user_data['email']}")
            
            # Commit all users
            db.session.commit()
            
            print(f"\n✅ Successfully created {len(created_users)} users!")
            print("\n📋 Login Credentials:")
            print("="*60)
            for user_data in created_users:
                premium_badge = "⭐ PREMIUM" if user_data.get('is_premium') else "🆓 FREE"
                print(f"\n{premium_badge}")
                print(f"   📧 Email:    {user_data['email']}")
                print(f"   🔐 Password: {user_data['password']}")
                print(f"   👤 Name:     {user_data['full_name']}")
            print("="*60)
            
            print("\n🎉 Database initialization complete!")
            print(f"🌐 Login at: https://web-production-6ec3a.up.railway.app/auth/login")
            
        except Exception as e:
            print(f"❌ Error during initialization: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()


if __name__ == '__main__':
    init_database()
