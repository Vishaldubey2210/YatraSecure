"""
API routes for mobile and external integrations
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models.user import Trip, User
from models.provider import ServiceProvider

api_bp = Blueprint('api', __name__)


@api_bp.route('/trips')
@login_required
def get_trips():
    """Get user's trips"""
    try:
        trips = Trip.query.filter_by(admin_user_id=current_user.user_id).all()
        return jsonify({
            'success': True,
            'trips': [{
                'id': t.trip_id,
                'name': t.trip_name,
                'destination': t.destination,
                'start_date': t.start_date.isoformat(),
                'end_date': t.end_date.isoformat(),
                'status': t.status
            } for t in trips]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/providers/search')
def search_providers():
    """Search service providers"""
    try:
        query = request.args.get('q', '')
        city = request.args.get('city', '')
        provider_type = request.args.get('type', '')
        
        results = ServiceProvider.query
        
        if query:
            results = results.filter(ServiceProvider.business_name.ilike(f'%{query}%'))
        if city:
            results = results.filter(ServiceProvider.city.ilike(f'%{city}%'))
        if provider_type:
            results = results.filter_by(provider_type=provider_type)
        
        providers = results.limit(20).all()
        
        return jsonify({
            'success': True,
            'results': [{
                'id': p.provider_id,
                'name': p.business_name,
                'type': p.provider_type,
                'city': p.city,
                'rating': p.rating
            } for p in providers]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api_bp.route('/health')
def health_check():
    """API health check"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })
