"""
Pool Wallet System for Group Trips
Members contribute, Admin manages payments
"""

from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from extensions import db
from models.user import Trip, TripMember

wallet_bp = Blueprint('wallet', __name__)


# In-memory wallet storage (use database in production)
pool_wallets = {}  # {trip_id: {'balance': 0, 'contributions': [], 'transactions': []}}


@wallet_bp.route('/trip/<int:trip_id>/wallet')
@login_required
def trip_wallet(trip_id):
    """View pool wallet"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check membership
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            from flask import flash, redirect, url_for
            flash('Not authorized', 'danger')
            return redirect(url_for('dashboard.user_dashboard'))
        
        # Get wallet data
        if trip_id not in pool_wallets:
            pool_wallets[trip_id] = {
                'balance': 0,
                'contributions': [],
                'transactions': []
            }
        
        wallet = pool_wallets[trip_id]
        members = TripMember.query.filter_by(trip_id=trip_id).all()
        
        return render_template('wallet/pool_wallet.html',
                             trip=trip,
                             wallet=wallet,
                             members=members,
                             is_admin=trip.admin_user_id == current_user.user_id)
    except Exception as e:
        print(f"Wallet error: {e}")
        from flask import flash, redirect, url_for
        flash('Error loading wallet', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@wallet_bp.route('/api/contribute', methods=['POST'])
@login_required
def contribute():
    """Add money to pool wallet"""
    try:
        data = request.get_json()
        trip_id = data.get('trip_id')
        amount = float(data.get('amount', 0))
        
        if amount <= 0:
            return jsonify({'success': False, 'error': 'Invalid amount'}), 400
        
        # Initialize wallet if needed
        if trip_id not in pool_wallets:
            pool_wallets[trip_id] = {
                'balance': 0,
                'contributions': [],
                'transactions': []
            }
        
        # Add contribution
        contribution = {
            'user_id': current_user.user_id,
            'user_name': current_user.full_name,
            'amount': amount,
            'timestamp': datetime.now().strftime('%Y-%m-%d %I:%M %p'),
            'status': 'completed'
        }
        
        pool_wallets[trip_id]['contributions'].append(contribution)
        pool_wallets[trip_id]['balance'] += amount
        
        # Add transaction
        transaction = {
            'type': 'credit',
            'description': f'{current_user.full_name} added funds',
            'amount': amount,
            'timestamp': datetime.now().strftime('%Y-%m-%d %I:%M %p'),
            'balance': pool_wallets[trip_id]['balance']
        }
        pool_wallets[trip_id]['transactions'].append(transaction)
        
        print(f"✅ Contribution: ₹{amount} by {current_user.full_name} to trip {trip_id}")
        
        return jsonify({
            'success': True,
            'message': 'Contribution successful!',
            'new_balance': pool_wallets[trip_id]['balance']
        })
        
    except Exception as e:
        print(f"Contribution error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@wallet_bp.route('/api/make-payment', methods=['POST'])
@login_required
def make_payment():
    """Admin makes payment from pool wallet"""
    try:
        data = request.get_json()
        trip_id = data.get('trip_id')
        amount = float(data.get('amount', 0))
        description = data.get('description', 'Payment')
        
        # Check if admin
        trip = Trip.query.get(trip_id)
        if trip.admin_user_id != current_user.user_id:
            return jsonify({'success': False, 'error': 'Only admin can make payments'}), 403
        
        # Check balance
        if trip_id not in pool_wallets:
            return jsonify({'success': False, 'error': 'No wallet found'}), 400
        
        wallet = pool_wallets[trip_id]
        
        if wallet['balance'] < amount:
            return jsonify({'success': False, 'error': 'Insufficient balance'}), 400
        
        # Deduct amount
        wallet['balance'] -= amount
        
        # Add transaction
        transaction = {
            'type': 'debit',
            'description': description,
            'amount': amount,
            'timestamp': datetime.now().strftime('%Y-%m-%d %I:%M %p'),
            'balance': wallet['balance']
        }
        wallet['transactions'].append(transaction)
        
        print(f"✅ Payment: ₹{amount} by admin for {description}")
        
        return jsonify({
            'success': True,
            'message': 'Payment successful!',
            'new_balance': wallet['balance']
        })
        
    except Exception as e:
        print(f"Payment error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@wallet_bp.route('/api/wallet-stats/<int:trip_id>')
@login_required
def wallet_stats(trip_id):
    """Get wallet statistics"""
    if trip_id not in pool_wallets:
        return jsonify({
            'balance': 0,
            'total_contributions': 0,
            'total_payments': 0,
            'contributor_count': 0
        })
    
    wallet = pool_wallets[trip_id]
    
    total_contributions = sum(c['amount'] for c in wallet['contributions'])
    total_payments = sum(t['amount'] for t in wallet['transactions'] if t['type'] == 'debit')
    
    return jsonify({
        'balance': wallet['balance'],
        'total_contributions': total_contributions,
        'total_payments': total_payments,
        'contributor_count': len(set(c['user_id'] for c in wallet['contributions']))
    })
