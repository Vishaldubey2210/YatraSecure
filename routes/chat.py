"""
Advanced Real-time Group Chat
Features: @yatra AI, Media Upload, Location, Video/Audio Calls
"""

from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from flask_socketio import emit, join_room, leave_room
from datetime import datetime
from extensions import db
from models.user import Trip, TripMember
import os
from werkzeug.utils import secure_filename

chat_bp = Blueprint('chat', __name__)

# Chat storage
active_users = {}  # {trip_id: [user_ids]}
UPLOAD_FOLDER = 'static/uploads/chat'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'webm', 'mp3', 'wav', 'ogg'}

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@chat_bp.route('/trip/<int:trip_id>/chat')
@login_required
def trip_chat(trip_id):
    """Trip group chat page"""
    try:
        trip = Trip.query.get_or_404(trip_id)
        
        # Check if user is member
        is_member = trip.admin_user_id == current_user.user_id or \
                    any(m.user_id == current_user.user_id for m in trip.members)
        
        if not is_member:
            from flask import flash, redirect, url_for
            flash('You are not a member of this trip', 'danger')
            return redirect(url_for('dashboard.user_dashboard'))
        
        # Get all members
        members = TripMember.query.filter_by(trip_id=trip_id).all()
        
        return render_template('chat/group_chat.html', 
                             trip=trip, 
                             members=members)
    except Exception as e:
        print(f"❌ Chat error: {e}")
        from flask import flash, redirect, url_for
        flash('Error loading chat', 'danger')
        return redirect(url_for('trip.trip_details', trip_id=trip_id))


@chat_bp.route('/upload-media', methods=['POST'])
@login_required
def upload_media():
    """Upload media files (images, videos, audio)"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{current_user.user_id}_{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            file_url = f'/static/uploads/chat/{filename}'
            file_ext = filename.rsplit('.', 1)[1].lower()
            
            # Determine file type
            if file_ext in ['jpg', 'jpeg', 'png', 'gif']:
                file_type = 'image'
            elif file_ext in ['mp4', 'webm']:
                file_type = 'video'
            elif file_ext in ['mp3', 'wav', 'ogg']:
                file_type = 'audio'
            else:
                file_type = 'file'
            
            print(f"✅ File uploaded: {filename}")
            
            return jsonify({
                'success': True,
                'file_url': file_url,
                'filename': filename,
                'file_type': file_type
            })
        
        return jsonify({'success': False, 'error': 'Invalid file type'}), 400
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


def get_ai_response(message, trip_context):
    """Get AI response using Gemini API"""
    try:
        import google.generativeai as genai
        import os
        
        api_key = os.getenv('GEMINI_API_KEY', '')
        
        if not api_key or api_key == 'YOUR_API_KEY':
            return "🤖 **YatraBot**: Hi! I'm YatraBot, your AI travel assistant. My AI brain isn't activated yet - ask admin to add GEMINI_API_KEY!"
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""You are YatraBot, a friendly AI travel assistant helping with a trip to {trip_context['destination']}.

Trip Info:
- Destination: {trip_context['destination']}
- Duration: {trip_context['duration']} days
- Budget: ₹{trip_context.get('budget', 'Not set')}

User question: {message}

Provide a helpful, friendly answer (max 4 sentences). Be enthusiastic about travel! Use emojis."""
        
        response = model.generate_content(prompt)
        return f"🤖 **YatraBot**: {response.text}"
        
    except ImportError:
        return "🤖 **YatraBot**: I need google-generativeai package installed! Ask admin to run: pip install google-generativeai"
    except Exception as e:
        print(f"AI error: {e}")
        return f"🤖 **YatraBot**: I can help with:\n• Best places in {trip_context['destination']} 🗺️\n• Local food recommendations 🍽️\n• Budget tips 💰\n• Travel safety 🛡️\n\nJust type @yatra followed by your question!"


# SocketIO Event Handlers
def init_socketio(socketio):
    """Initialize SocketIO events for real-time chat"""
    
    @socketio.on('join_trip_chat')
    def handle_join(data):
        """User joins trip chat room"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        
        join_room(room)
        
        # Track active users
        if trip_id not in active_users:
            active_users[trip_id] = []
        if current_user.user_id not in active_users[trip_id]:
            active_users[trip_id].append(current_user.user_id)
        
        # Notify others
        emit('user_joined', {
            'user_id': current_user.user_id,
            'user_name': current_user.full_name,
            'message': f'{current_user.full_name} joined the chat',
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'active_count': len(active_users[trip_id])
        }, room=room)
        
        print(f"✅ {current_user.email} joined trip_{trip_id} chat")
    
    
    @socketio.on('send_message')
    def handle_message(data):
        """Handle chat message with AI support"""
        try:
            trip_id = data.get('trip_id')
            message = data.get('message', '').strip()
            message_type = data.get('type', 'text')
            file_url = data.get('file_url')
            file_type = data.get('file_type')
            location = data.get('location')
            
            if not message and not file_url and not location:
                return
            
            room = f'trip_{trip_id}'
            
            # Check for @yatra AI trigger
            if message and message.lower().startswith('@yatra'):
                # Get trip context for AI
                trip = Trip.query.get(trip_id)
                trip_context = {
                    'destination': trip.destination if trip else 'Unknown',
                    'duration': trip.duration_days if trip else 0,
                    'budget': trip.total_budget if trip and trip.total_budget else 0
                }
                
                # Extract query (remove @yatra)
                query = message[6:].strip()  # Remove '@yatra'
                
                if not query:
                    query = "What can you help me with?"
                
                # Get AI response
                ai_response = get_ai_response(query, trip_context)
                
                # Send AI message to everyone
                emit('new_message', {
                    'user_id': 0,  # AI/Bot
                    'user_name': 'YatraBot',
                    'message': ai_response,
                    'timestamp': datetime.now().strftime('%I:%M %p'),
                    'avatar': '🤖',
                    'type': 'ai',
                    'is_ai': True
                }, room=room)
                
                print(f"🤖 AI responded to: {query}")
                return
            
            # Regular message
            msg_data = {
                'user_id': current_user.user_id,
                'user_name': current_user.full_name,
                'message': message,
                'timestamp': datetime.now().strftime('%I:%M %p'),
                'avatar': current_user.full_name[0].upper(),
                'type': message_type,
                'file_url': file_url,
                'file_type': file_type,
                'location': location
            }
            
            # Broadcast to room
            emit('new_message', msg_data, room=room)
            
            print(f"💬 {current_user.full_name}: {message or '[media]'}")
            
        except Exception as e:
            print(f"❌ Message error: {e}")
            import traceback
            traceback.print_exc()
    
    
    @socketio.on('leave_trip_chat')
    def handle_leave(data):
        """User leaves chat room"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        
        leave_room(room)
        
        # Remove from active users
        if trip_id in active_users and current_user.user_id in active_users[trip_id]:
            active_users[trip_id].remove(current_user.user_id)
        
        # Notify others
        emit('user_left', {
            'user_id': current_user.user_id,
            'user_name': current_user.full_name,
            'message': f'{current_user.full_name} left the chat',
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'active_count': len(active_users.get(trip_id, []))
        }, room=room)
        
        print(f"❌ {current_user.email} left trip_{trip_id} chat")
    
    
    @socketio.on('typing')
    def handle_typing(data):
        """Handle typing indicator"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        
        emit('user_typing', {
            'user_id': current_user.user_id,
            'user_name': current_user.full_name
        }, room=room, include_self=False)
    
    
    @socketio.on('start_video_call')
    def handle_video_call(data):
        """Start video call notification"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        
        emit('video_call_started', {
            'caller_id': current_user.user_id,
            'caller_name': current_user.full_name,
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'message': f'{current_user.full_name} started a video call'
        }, room=room)
        
        print(f"📹 Video call started by {current_user.full_name}")
    
    
    @socketio.on('start_audio_call')
    def handle_audio_call(data):
        """Start audio call notification"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        
        emit('audio_call_started', {
            'caller_id': current_user.user_id,
            'caller_name': current_user.full_name,
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'message': f'{current_user.full_name} started an audio call'
        }, room=room)
        
        print(f"🎤 Audio call started by {current_user.full_name}")
    
    
    @socketio.on('share_location')
    def handle_location(data):
        """Share location in chat"""
        trip_id = data.get('trip_id')
        room = f'trip_{trip_id}'
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        emit('new_message', {
            'user_id': current_user.user_id,
            'user_name': current_user.full_name,
            'message': 'Shared location',
            'timestamp': datetime.now().strftime('%I:%M %p'),
            'avatar': current_user.full_name[0].upper(),
            'type': 'location',
            'location': {
                'latitude': latitude,
                'longitude': longitude
            }
        }, room=room)
        
        print(f"📍 {current_user.full_name} shared location")
