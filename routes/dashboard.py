"""
Dashboard routes for user interface
Complete version with Premium activation
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from extensions import db
from models.user import User, Trip, TripMember
from models.provider import Booking

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/user')
@login_required
def user_dashboard():
    """Main user dashboard"""
    try:
        # Get user's trips
        my_trips = Trip.query.filter_by(admin_user_id=current_user.user_id).all()
        
        # Get joined trips
        joined_trip_ids = [m.trip_id for m in TripMember.query.filter_by(user_id=current_user.user_id).all()]
        joined_trips = Trip.query.filter(Trip.trip_id.in_(joined_trip_ids)).all() if joined_trip_ids else []
        
        # Get bookings
        bookings = Booking.query.filter_by(user_id=current_user.user_id).order_by(Booking.created_at.desc()).limit(5).all()
        
        # Calculate stats
        stats = {
            'total_trips': len(my_trips) + len(joined_trips),
            'active_trips': len([t for t in my_trips + joined_trips if t.status == 'active']),
            'total_bookings': Booking.query.filter_by(user_id=current_user.user_id).count(),
            'premium_active': current_user.is_premium_active if hasattr(current_user, 'is_premium_active') else False
        }
        
        # Mock alerts (replace with actual data)
        alerts = []
        
        return render_template('dashboard/user_dashboard.html',
                             my_trips=my_trips,
                             joined_trips=joined_trips,
                             bookings=bookings,
                             stats=stats,
                             alerts=alerts)
    except Exception as e:
        print(f"Dashboard error: {e}")
        flash('Error loading dashboard', 'danger')
        return render_template('dashboard/user_dashboard.html',
                             my_trips=[],
                             joined_trips=[],
                             bookings=[],
                             stats={'total_trips': 0, 'active_trips': 0, 'total_bookings': 0, 'premium_active': False},
                             alerts=[])


@dashboard_bp.route('/trips')
@login_required
def my_trips():
    """View all user trips"""
    try:
        # Get user's created trips
        my_trips = Trip.query.filter_by(admin_user_id=current_user.user_id).all()
        
        # Get joined trips
        joined_memberships = TripMember.query.filter_by(user_id=current_user.user_id).all()
        joined_trips = [Trip.query.get(m.trip_id) for m in joined_memberships]
        
        # Combine all trips
        all_trips = my_trips + [t for t in joined_trips if t]
        
        return render_template('dashboard/my_trips.html', trips=all_trips)
    except Exception as e:
        print(f"My trips error: {e}")
        flash('Error loading trips', 'danger')
        return render_template('dashboard/my_trips.html', trips=[])


@dashboard_bp.route('/bookings')
@login_required
def my_bookings():
    """View all user bookings"""
    try:
        bookings = Booking.query.filter_by(user_id=current_user.user_id).order_by(Booking.created_at.desc()).all()
        return render_template('dashboard/my_bookings.html', bookings=bookings)
    except Exception as e:
        print(f"Bookings error: {e}")
        flash('Error loading bookings', 'danger')
        return render_template('dashboard/my_bookings.html', bookings=[])


@dashboard_bp.route('/profile')
@login_required
def profile():
    """View user profile"""
    return render_template('dashboard/profile.html')


@dashboard_bp.route('/premium', methods=['GET', 'POST'])
@login_required
def premium():
    """Premium upgrade page with instant activation (DEMO)"""
    if request.method == 'POST':
        try:
            plan = request.form.get('plan')
            
            print(f"🌟 Premium activation request - User: {current_user.email}, Plan: {plan}")
            
            # Validate plan
            if plan not in ['basic', 'pro', 'enterprise']:
                flash('Invalid plan selected', 'danger')
                return redirect(url_for('dashboard.premium'))
            
            # Demo: Instant activation without payment
            current_user.is_premium = True
            current_user.premium_plan = plan
            current_user.premium_start_date = datetime.utcnow()
            
            # Set expiry (1 year for demo)
            current_user.premium_end_date = datetime.utcnow() + timedelta(days=365)
            
            db.session.commit()
            
            plan_names = {
                'basic': 'Basic Plan',
                'pro': 'Pro Plan',
                'enterprise': 'Enterprise Plan'
            }
            
            plan_prices = {
                'basic': '₹499',
                'pro': '₹999',
                'enterprise': '₹2,499'
            }
            
            print(f"✅ Premium activated: {plan_names[plan]} for {current_user.email}")
            
            flash(f'🎉 Congratulations! {plan_names[plan]} ({plan_prices[plan]}/month) activated successfully! Welcome to Premium YatraSecure!', 'success')
            return redirect(url_for('dashboard.user_dashboard'))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Premium activation error: {e}")
            import traceback
            traceback.print_exc()
            flash('Error activating premium. Please try again.', 'danger')
            return redirect(url_for('dashboard.premium'))
    
    # GET request - show premium plans
    return render_template('dashboard/premium.html')


@dashboard_bp.route('/premium/cancel', methods=['POST'])
@login_required
def cancel_premium():
    """Cancel premium subscription (DEMO)"""
    try:
        if not current_user.is_premium:
            flash('You do not have an active premium subscription', 'warning')
            return redirect(url_for('dashboard.user_dashboard'))
        
        # Cancel premium
        old_plan = current_user.premium_plan
        current_user.is_premium = False
        current_user.premium_plan = None
        current_user.premium_end_date = None
        
        db.session.commit()
        
        print(f"❌ Premium cancelled: {old_plan} for {current_user.email}")
        
        flash('Premium subscription cancelled successfully', 'info')
        return redirect(url_for('dashboard.user_dashboard'))
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling premium: {e}")
        flash('Error cancelling subscription', 'danger')
        return redirect(url_for('dashboard.user_dashboard'))


@dashboard_bp.route('/emergency')
@login_required
def emergency():
    """Emergency SOS page"""
    return render_template('dashboard/emergency.html')
