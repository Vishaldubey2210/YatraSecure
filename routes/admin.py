"""
Admin panel routes
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db
from models.user import User, Trip
from models.provider import ServiceProvider, Booking
from models.safety import CommunityReport
from models.analytics import Analytics
from utils.security import admin_required
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard')
@login_required
@admin_required
def admin_dashboard():
    """Admin dashboard"""
    # Statistics
    total_users = User.query.count()
    premium_users = User.query.filter_by(is_premium=True).count()
    total_providers = ServiceProvider.query.count()
    pending_providers = ServiceProvider.query.filter_by(is_verified=False).count()
    total_trips = Trip.query.count()
    total_bookings = Booking.query.count()
    
    # Recent activity
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    recent_trips = Trip.query.order_by(Trip.created_at.desc()).limit(10).all()
    pending_reports = CommunityReport.query.filter_by(is_verified=False).order_by(CommunityReport.created_at.desc()).limit(10).all()
    
    stats = {
        'total_users': total_users,
        'premium_users': premium_users,
        'total_providers': total_providers,
        'pending_providers': pending_providers,
        'total_trips': total_trips,
        'total_bookings': total_bookings
    }
    
    return render_template('admin/admin_dashboard.html',
                         stats=stats,
                         recent_users=recent_users,
                         recent_trips=recent_trips,
                         pending_reports=pending_reports)


@admin_bp.route('/users')
@login_required
@admin_required
def user_management():
    """Manage users"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.full_name.ilike(f'%{search}%')
            )
        )
    
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/user_management.html',
                         users=users,
                         search=search)


@admin_bp.route('/providers')
@login_required
@admin_required
def provider_management():
    """Manage service providers"""
    status = request.args.get('status', 'all')
    
    query = ServiceProvider.query
    
    if status == 'pending':
        query = query.filter_by(is_verified=False)
    elif status == 'verified':
        query = query.filter_by(is_verified=True)
    
    providers = query.order_by(ServiceProvider.created_at.desc()).all()
    
    return render_template('admin/provider_approvals.html',
                         providers=providers,
                         status=status)


@admin_bp.route('/provider/<int:provider_id>/verify', methods=['POST'])
@login_required
@admin_required
def verify_provider(provider_id):
    """Verify a service provider"""
    provider = ServiceProvider.query.get_or_404(provider_id)
    provider.is_verified = True
    
    try:
        db.session.commit()
        flash(f'{provider.business_name} verified successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error verifying provider.', 'danger')
    
    return redirect(url_for('admin.provider_management'))


@admin_bp.route('/reports')
@login_required
@admin_required
def report_moderation():
    """Moderate community reports"""
    reports = CommunityReport.query.filter_by(is_verified=False).order_by(CommunityReport.created_at.desc()).all()
    
    return render_template('admin/report_moderation.html', reports=reports)


@admin_bp.route('/report/<int:report_id>/verify', methods=['POST'])
@login_required
@admin_required
def verify_report(report_id):
    """Verify a community report"""
    report = CommunityReport.query.get_or_404(report_id)
    report.is_verified = True
    
    try:
        db.session.commit()
        flash('Report verified.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error verifying report.', 'danger')
    
    return redirect(url_for('admin.report_moderation'))


@admin_bp.route('/analytics')
@login_required
@admin_required
def analytics():
    """View platform analytics"""
    # Get analytics data for last 30 days
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)
    
    # Daily signups
    signups = db.session.query(
        db.func.date(User.created_at).label('date'),
        db.func.count(User.user_id).label('count')
    ).filter(
        db.func.date(User.created_at) >= start_date
    ).group_by(db.func.date(User.created_at)).all()
    
    # Premium subscriptions
    premium_subs = User.query.filter(
        User.is_premium == True,
        User.premium_expiry >= datetime.utcnow()
    ).count()
    
    # Revenue estimate (simplified)
    from flask import current_app
    pricing = current_app.config['PRICING']
    estimated_revenue = premium_subs * pricing['monthly']  # Simplified
    
    analytics_data = {
        'signups': signups,
        'premium_subs': premium_subs,
        'estimated_revenue': estimated_revenue
    }
    
    return render_template('admin/analytics.html', analytics_data=analytics_data)
