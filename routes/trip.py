"""
Trip management routes - COMPLETE PRODUCTION VERSION
All features: Create, Join, AI Planner, Itinerary, Expenses, ML Safety Score
Enhanced error handling and fallbacks
"""

from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
import random
import string
import traceback
from extensions import db
from models.user import Trip, TripMember, Itinerary, Expense
from utils.validators import validate_date_range, validate_budget

trip_bp = Blueprint('trip', __name__)


def generate_join_code():
    """Generate unique 6-character join code"""
    max_attempts = 10
    for _ in range(max_attempts):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if not Trip.query.filter_by(join_code=code).first():
            return code
    # Fallback: add timestamp if still not unique
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5)) + str(datetime.now().second)


@trip_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_trip():
    """Create a new trip with AI planner option"""
    if request.method == 'POST':
        try:
            trip_name = request.form.get('trip_name', '').strip()
            destination = request.form.get('destination', '').strip()
            start_date = request.form.get('start_date')
            end_date = request.form.get('end_date')
            total_budget = request.form.get('total_budget')
            trip_type = request.form.get('trip_type', '')
            use_ai = request.form.get('use_ai', 'no')
            
            # Validate required fields
            if not all([trip_name, destination, start_date, end_date]):
                flash('Please fill all required fields', 'danger')
                return render_template('trip/create_trip.html')
            
            # Validate dates
            is_valid, error = validate_date_range(start_date, end_date)
            if not is_valid:
                flash(error, 'danger')
                return render_template('trip/create_trip.html')
            
            # Validate budget if provided
            if total_budget:
                is_valid, error = validate_budget(total_budget)
                if not is_valid:
                    flash(error, 'danger')
                    return render_template('trip/create_trip.html')
            
            # Create trip
            new_trip = Trip(
                trip_name=trip_name,
                admin_user_id=current_user.user_id,
                join_code=generate_join_code(),
                destination=destination,
                start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
                end_date=datetime.strptime(end_date, '%Y-%m-%d').date(),
                total_budget=float(total_budget) if total_budget else None,
                trip_type=trip_type,
                status='planning'
            )
            
            db.session.add(new_trip)
            db.session.flush()
            
            # Add creator as admin member
            member = TripMember(
                trip_id=new_trip.trip_id,
                user_id=current_user.user_id,
                role='admin'
            )
            db.session.add(member)
            db.session.commit()
            
            print(f"✅ Trip created: {new_trip.trip_name} (ID: {new_trip.trip_id})")
            
            flash(f'Trip created successfully! Join Code: {new_trip.join_code}', 'success')
            
            # Redirect based on AI preference
            if use_ai == 'yes':
                return redirect(url_for('trip.ai_planner', trip_id=new_trip.trip_id))
            else:
                return redirect(url_for('trip.trip_details', trip_id=new_trip.trip_id))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Create trip error: {e}")
            traceback.print_exc()
            flash('Error creating trip. Please try again.', 'danger')
    
    try:
        return render_template('trip/create_trip.html')
    except Exception as e:
        print(f"❌ Template error: {e}")
        return "Template error. Please contact admin.", 500


@trip_bp.route('/<int:trip_id>')
@login_required
def trip_details(trip_id):
    """View trip details - COMPLETE VERSION"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check if user is member
        is_member = TripMember.query.filter_by(
            trip_id=trip_id,
            user_id=current_user.user_id
        ).first() is not None
        
        is_admin = trip.admin_user_id == current_user.user_id
        
        if not is_member and not is_admin:
            flash('You are not a member of this trip', 'warning')
            return redirect(url_for('dashboard.user_dashboard'))
        
        # Get trip data
        members = TripMember.query.filter_by(trip_id=trip_id).all()
        itinerary = Itinerary.query.filter_by(trip_id=trip_id).order_by(Itinerary.day_number).all()
        expenses = Expense.query.filter_by(trip_id=trip_id).order_by(Expense.expense_date.desc()).all()
        
        # Calculate stats
        total_expenses = sum([e.amount for e in expenses]) if expenses else 0
        remaining_budget = (trip.total_budget - total_expenses) if trip.total_budget else None
        
        return render_template('trip/trip_details.html',
                             trip=trip,
                             members=members,
                             itinerary=itinerary,
                             expenses=expenses,
                             total_expenses=total_expenses,
                             remaining_budget=remaining_budget,
                             is_admin=is_admin)
    except Exception as e:
        print(f"❌ Trip details error: {e}")
        traceback.print_exc()
        flash('Error loading trip details', 'danger')
        return redirect(url_for('dashboard.user_dashboard'))


@trip_bp.route('/join', methods=['GET', 'POST'])
@login_required
def join_trip():
    """Join a trip using join code"""
    if request.method == 'POST':
        try:
            join_code = request.form.get('join_code', '').strip().upper()
            
            if not join_code:
                flash('Please enter join code', 'danger')
                return render_template('trip/join_trip.html')
            
            # Find trip
            trip = Trip.query.filter_by(join_code=join_code).first()
            
            if not trip:
                flash('Invalid join code. Please check and try again.', 'danger')
                return render_template('trip/join_trip.html')
            
            # Check if already member
            existing = TripMember.query.filter_by(
                trip_id=trip.trip_id,
                user_id=current_user.user_id
            ).first()
            
            if existing:
                flash('You are already a member of this trip!', 'info')
                return redirect(url_for('trip.trip_details', trip_id=trip.trip_id))
            
            # Add member
            new_member = TripMember(
                trip_id=trip.trip_id,
                user_id=current_user.user_id,
                role='member'
            )
            db.session.add(new_member)
            db.session.commit()
            
            print(f"✅ User {current_user.email} joined trip {trip.trip_name}")
            
            flash(f'Successfully joined {trip.trip_name}!', 'success')
            return redirect(url_for('trip.trip_details', trip_id=trip.trip_id))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Join trip error: {e}")
            traceback.print_exc()
            flash('Error joining trip. Please try again.', 'danger')
    
    return render_template('trip/join_trip.html')


@trip_bp.route('/<int:trip_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_trip(trip_id):
    """Edit trip details"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Only admin can edit
        if trip.admin_user_id != current_user.user_id:
            flash('Only trip admin can edit', 'danger')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        if request.method == 'POST':
            trip.trip_name = request.form.get('trip_name', trip.trip_name)
            trip.destination = request.form.get('destination', trip.destination)
            
            budget = request.form.get('total_budget')
            if budget:
                try:
                    trip.total_budget = float(budget)
                except ValueError:
                    flash('Invalid budget amount', 'warning')
            
            trip.trip_type = request.form.get('trip_type', trip.trip_type)
            trip.status = request.form.get('status', trip.status)
            
            db.session.commit()
            
            print(f"✅ Trip updated: {trip.trip_name}")
            
            flash('Trip updated successfully!', 'success')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        return render_template('trip/edit_trip.html', trip=trip)
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Edit trip error: {e}")
        traceback.print_exc()
        flash('Error updating trip', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@trip_bp.route('/<int:trip_id>/delete', methods=['POST'])
@login_required
def delete_trip(trip_id):
    """Delete trip"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Only admin can delete
        if trip.admin_user_id != current_user.user_id:
            flash('Only trip admin can delete', 'danger')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        trip_name = trip.trip_name
        db.session.delete(trip)
        db.session.commit()
        
        print(f"✅ Trip deleted: {trip_name}")
        
        flash(f'Trip "{trip_name}" deleted successfully', 'success')
        return redirect(url_for('dashboard.user_dashboard'))
        
    except Exception as e:
        print(f"❌ Delete trip error: {e}")
        traceback.print_exc()
        flash('Error deleting trip', 'danger')
        db.session.rollback()
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


# ============================================
# AI ITINERARY PLANNER ROUTES
# ============================================

@trip_bp.route('/<int:trip_id>/ai-planner')
@login_required
def ai_planner(trip_id):
    """AI-powered itinerary planner"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check if user is member
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            flash('You do not have access to this trip', 'danger')
            return redirect(url_for('dashboard.user_dashboard'))
        
        return render_template('trip/ai_planner.html', trip=trip)
        
    except Exception as e:
        print(f"❌ AI planner error: {e}")
        traceback.print_exc()
        flash('Error loading AI planner', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@trip_bp.route('/<int:trip_id>/itinerary')
@login_required
def view_itinerary(trip_id):
    """View saved itinerary"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check access
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            flash('You do not have access to this trip', 'danger')
            return redirect(url_for('dashboard.user_dashboard'))
        
        # Get itinerary
        itinerary_items = Itinerary.query.filter_by(trip_id=trip_id)\
                                        .order_by(Itinerary.day_number).all()
        
        if not itinerary_items:
            flash('No itinerary created yet. Use AI planner to generate one!', 'info')
            return redirect(url_for('trip.ai_planner', trip_id=trip_id))
        
        return render_template('trip/view_itinerary.html', 
                             trip=trip, 
                             itinerary=itinerary_items)
        
    except Exception as e:
        print(f"❌ View itinerary error: {e}")
        traceback.print_exc()
        flash('Error loading itinerary', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@trip_bp.route('/api/<int:trip_id>/save-itinerary', methods=['POST'])
@login_required
def save_itinerary(trip_id):
    """Save AI-generated itinerary"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check access
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        itinerary_data = data.get('itinerary', [])
        
        if not itinerary_data:
            return jsonify({'success': False, 'error': 'No itinerary data provided'}), 400
        
        # Clear existing itinerary
        Itinerary.query.filter_by(trip_id=trip_id).delete()
        
        # Calculate dates
        current_date = trip.start_date
        
        # Save new itinerary
        for idx, day_data in enumerate(itinerary_data):
            day_date = current_date + timedelta(days=idx)
            
            # Handle time parsing safely
            start_time = None
            end_time = None
            
            if day_data.get('start_time'):
                try:
                    start_time = datetime.strptime(day_data['start_time'], '%H:%M').time()
                except:
                    pass
            
            if day_data.get('end_time'):
                try:
                    end_time = datetime.strptime(day_data['end_time'], '%H:%M').time()
                except:
                    pass
            
            itinerary_item = Itinerary(
                trip_id=trip_id,
                day_number=day_data.get('day', idx + 1),
                date=day_date,
                location=day_data.get('location', trip.destination),
                activity=day_data.get('activities', day_data.get('description', '')),
                start_time=start_time,
                end_time=end_time,
                estimated_cost=float(day_data.get('estimated_cost', 0)) if day_data.get('estimated_cost') else 0,
                notes=day_data.get('description', '')
            )
            db.session.add(itinerary_item)
        
        db.session.commit()
        
        print(f"✅ Itinerary saved for trip {trip_id} ({len(itinerary_data)} days)")
        
        return jsonify({
            'success': True,
            'message': 'Itinerary saved successfully!',
            'itinerary_id': trip_id,
            'days_saved': len(itinerary_data)
        })
        
    except Exception as e:
        print(f"❌ Save itinerary error: {e}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Failed to save itinerary'}), 500


@trip_bp.route('/api/<int:trip_id>/update-itinerary-item/<int:item_id>', methods=['PUT'])
@login_required
def update_itinerary_item(trip_id, item_id):
    """Update single itinerary item"""
    try:
        item = Itinerary.query.get_or_404(item_id)
        
        # Verify item belongs to trip
        if item.trip_id != trip_id:
            return jsonify({'success': False, 'error': 'Invalid item'}), 400
        
        data = request.get_json()
        
        # Update fields safely
        if 'activity' in data:
            item.activity = data['activity']
        if 'location' in data:
            item.location = data['location']
        if 'start_time' in data:
            try:
                item.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            except:
                pass
        if 'end_time' in data:
            try:
                item.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
            except:
                pass
        if 'estimated_cost' in data:
            try:
                item.estimated_cost = float(data['estimated_cost'])
            except:
                pass
        if 'notes' in data:
            item.notes = data['notes']
        
        db.session.commit()
        
        print(f"✅ Itinerary item {item_id} updated")
        
        return jsonify({'success': True, 'message': 'Updated successfully!'})
        
    except Exception as e:
        print(f"❌ Update itinerary error: {e}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Update failed'}), 500


# ============================================
# ML SAFETY SCORE FOR TRIP (NEW)
# ============================================

@trip_bp.route('/<int:trip_id>/safety-analysis')
@login_required
def trip_safety_analysis(trip_id):
    """Get overall trip safety analysis using ML model"""
    try:
        from services.safety_calculator import calculator
        
        trip = Trip.query.get_or_404(trip_id)
        
        # Check access
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            return jsonify({'success': False, 'error': 'Access denied'}), 403
        
        # Get itinerary
        itinerary_items = Itinerary.query.filter_by(trip_id=trip_id).order_by(Itinerary.day_number).all()
        
        if not itinerary_items:
            return jsonify({
                'success': False,
                'message': 'No itinerary found. Create itinerary first.'
            })
        
        # Calculate safety for each location
        location_scores = []
        total_score = 0
        
        # Extract state and district from destination
        destination_parts = trip.destination.split(',')
        state = destination_parts[0].strip() if len(destination_parts) > 0 else trip.destination
        
        for item in itinerary_items:
            # Use location from itinerary or trip destination
            district = item.location if item.location else (destination_parts[-1].strip() if len(destination_parts) > 1 else state)
            
            # Get ML prediction
            score = calculator.predict_safety_score(
                state=state,
                district=district
            )
            
            location_scores.append({
                'day': item.day_number,
                'location': item.location,
                'score': score,
                'date': item.date.strftime('%b %d') if item.date else ''
            })
            
            total_score += score
        
        # Calculate overall score
        overall_score = round(total_score / len(location_scores), 2) if location_scores else 0
        
        # Determine risk level
        if overall_score >= 75:
            risk_level = 'low'
            risk_color = 'green'
        elif overall_score >= 50:
            risk_level = 'medium'
            risk_color = 'yellow'
        else:
            risk_level = 'high'
            risk_color = 'red'
        
        return jsonify({
            'success': True,
            'trip_name': trip.trip_name,
            'destination': trip.destination,
            'overall_score': overall_score,
            'risk_level': risk_level,
            'risk_color': risk_color,
            'location_scores': location_scores,
            'powered_by': 'ML Model'
        })
        
    except Exception as e:
        print(f"❌ Safety analysis error: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# MANUAL ITINERARY & EXPENSE ROUTES
# ============================================

@trip_bp.route('/<int:trip_id>/itinerary/add', methods=['POST'])
@login_required
def add_itinerary(trip_id):
    """Add itinerary item manually"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check if user is member
        is_member = TripMember.query.filter_by(
            trip_id=trip_id,
            user_id=current_user.user_id
        ).first() is not None
        
        if not is_member:
            flash('Not authorized', 'danger')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        day_number = request.form.get('day_number', type=int)
        date = request.form.get('date')
        location = request.form.get('location')
        activity = request.form.get('activity')
        
        new_item = Itinerary(
            trip_id=trip_id,
            day_number=day_number,
            date=datetime.strptime(date, '%Y-%m-%d').date(),
            location=location,
            activity=activity
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        print(f"✅ Manual itinerary item added to trip {trip_id}")
        
        flash('Itinerary item added!', 'success')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Add itinerary error: {e}")
        traceback.print_exc()
        flash('Error adding itinerary item', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@trip_bp.route('/<int:trip_id>/expense/add', methods=['POST'])
@login_required
def add_expense(trip_id):
    """Add expense"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        is_member = TripMember.query.filter_by(
            trip_id=trip_id,
            user_id=current_user.user_id
        ).first() is not None
        
        if not is_member:
            flash('Not authorized', 'danger')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        amount = request.form.get('amount', type=float)
        category = request.form.get('category')
        description = request.form.get('description')
        expense_date = request.form.get('expense_date')
        
        if not all([amount, category, description, expense_date]):
            flash('Please fill all fields', 'warning')
            return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
        new_expense = Expense(
            trip_id=trip_id,
            paid_by_user_id=current_user.user_id,
            amount=amount,
            category=category,
            description=description,
            expense_date=datetime.strptime(expense_date, '%Y-%m-%d').date(),
            split_type='equal'
        )
        
        db.session.add(new_expense)
        db.session.commit()
        
        print(f"✅ Expense ₹{amount} added to trip {trip_id} by {current_user.email}")
        
        flash('Expense added successfully!', 'success')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Add expense error: {e}")
        traceback.print_exc()
        flash('Error adding expense', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))
