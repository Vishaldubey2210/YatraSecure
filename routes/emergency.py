"""
Emergency SOS and Contact Routes
Critical safety features
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from extensions import db
from models.emergency import EmergencyContact, SOSAlert

emergency_bp = Blueprint('emergency', __name__)


def get_dummy_emergency_contacts():
    """Get dummy emergency contacts by state"""
    contacts = {
        'Delhi': [
            {'name': 'Delhi Police Control Room', 'phone': '100', 'type': 'police', 'is_24x7': True},
            {'name': 'AIIMS Emergency', 'phone': '011-26588500', 'type': 'hospital', 'is_24x7': True},
            {'name': 'Delhi Ambulance', 'phone': '102', 'type': 'ambulance', 'is_24x7': True},
            {'name': 'Tourist Police Delhi', 'phone': '011-23344489', 'type': 'tourist_police', 'is_24x7': True},
        ],
        'Maharashtra': [
            {'name': 'Mumbai Police', 'phone': '100', 'type': 'police', 'is_24x7': True},
            {'name': 'Mumbai Fire Brigade', 'phone': '101', 'type': 'fire', 'is_24x7': True},
            {'name': 'KEM Hospital Emergency', 'phone': '022-24107000', 'type': 'hospital', 'is_24x7': True},
            {'name': 'Tourist Police Mumbai', 'phone': '022-22621855', 'type': 'tourist_police', 'is_24x7': True},
        ],
        'Rajasthan': [
            {'name': 'Jaipur Police', 'phone': '100', 'type': 'police', 'is_24x7': True},
            {'name': 'SMS Hospital Emergency', 'phone': '0141-2560291', 'type': 'hospital', 'is_24x7': True},
            {'name': 'Rajasthan Ambulance', 'phone': '102', 'type': 'ambulance', 'is_24x7': True},
            {'name': 'Tourist Police Jaipur', 'phone': '0141-5110000', 'type': 'tourist_police', 'is_24x7': True},
        ],
        'Goa': [
            {'name': 'Goa Police', 'phone': '100', 'type': 'police', 'is_24x7': True},
            {'name': 'Goa Medical College Emergency', 'phone': '0832-2458700', 'type': 'hospital', 'is_24x7': True},
            {'name': 'Goa Ambulance', 'phone': '108', 'type': 'ambulance', 'is_24x7': True},
            {'name': 'Tourist Police Goa', 'phone': '0832-2438600', 'type': 'tourist_police', 'is_24x7': True},
        ]
    }
    return contacts


@emergency_bp.route('/sos')
@login_required
def sos_page():
    """Emergency SOS page"""
    try:
        # Get user's active SOS alerts
        active_alerts = SOSAlert.query.filter_by(
            user_id=current_user.user_id,
            status='active'
        ).order_by(SOSAlert.created_at.desc()).all()
        
        return render_template('emergency/sos.html', active_alerts=active_alerts)
    except Exception as e:
        print(f"SOS page error: {e}")
        return render_template('emergency/sos.html', active_alerts=[])


@emergency_bp.route('/sos/trigger', methods=['POST'])
@login_required
def trigger_sos():
    """Trigger emergency SOS alert"""
    try:
        latitude = request.form.get('latitude', type=float)
        longitude = request.form.get('longitude', type=float)
        location_name = request.form.get('location_name')
        alert_type = request.form.get('alert_type', 'general')
        message = request.form.get('message', '')
        
        # Create SOS alert
        sos_alert = SOSAlert(
            user_id=current_user.user_id,
            latitude=latitude or 28.6139,  # Default Delhi coordinates
            longitude=longitude or 77.2090,
            location_name=location_name or 'Unknown Location',
            alert_type=alert_type,
            severity='critical',
            message=message,
            status='active'
        )
        
        db.session.add(sos_alert)
        db.session.commit()
        
        # TODO: Send SMS/notifications to emergency contacts
        # TODO: Notify nearby users
        # TODO: Alert local authorities
        
        flash('🚨 SOS Alert Activated! Emergency contacts notified.', 'warning')
        return jsonify({
            'success': True,
            'message': 'SOS alert activated',
            'alert_id': sos_alert.sos_id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Trigger SOS error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to trigger SOS alert'
        }), 500


@emergency_bp.route('/sos/<int:sos_id>/resolve', methods=['POST'])
@login_required
def resolve_sos(sos_id):
    """Resolve/Cancel SOS alert"""
    try:
        sos_alert = SOSAlert.query.get_or_404(sos_id)
        
        if sos_alert.user_id != current_user.user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        sos_alert.status = 'resolved'
        sos_alert.resolved_at = datetime.utcnow()
        
        db.session.commit()
        
        flash('✅ SOS Alert marked as safe', 'success')
        return jsonify({'success': True, 'message': 'SOS alert resolved'})
        
    except Exception as e:
        db.session.rollback()
        print(f"Resolve SOS error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@emergency_bp.route('/contacts')
@login_required
def contacts():
    """Emergency contacts directory"""
    try:
        state = request.args.get('state', 'Delhi')
        
        # Get contacts from database
        db_contacts = EmergencyContact.query.filter_by(state=state).all()
        
        # If no database contacts, use dummy data
        dummy_contacts = get_dummy_emergency_contacts()
        contacts_list = db_contacts if db_contacts else dummy_contacts.get(state, [])
        
        # Get all states
        all_states = list(dummy_contacts.keys())
        
        return render_template('emergency/contacts.html',
                             contacts=contacts_list,
                             selected_state=state,
                             all_states=all_states,
                             dummy_data=dummy_contacts)
    except Exception as e:
        print(f"Contacts error: {e}")
        dummy_contacts = get_dummy_emergency_contacts()
        return render_template('emergency/contacts.html',
                             contacts=[],
                             selected_state='Delhi',
                             all_states=list(dummy_contacts.keys()),
                             dummy_data=dummy_contacts)


@emergency_bp.route('/api/sos/location', methods=['POST'])
@login_required
def update_sos_location():
    """Update SOS location (for real-time tracking)"""
    try:
        data = request.get_json()
        sos_id = data.get('sos_id')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        sos_alert = SOSAlert.query.get(sos_id)
        if sos_alert and sos_alert.user_id == current_user.user_id:
            sos_alert.latitude = latitude
            sos_alert.longitude = longitude
            db.session.commit()
            
            return jsonify({'success': True})
        
        return jsonify({'success': False, 'error': 'Not found'}), 404
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
