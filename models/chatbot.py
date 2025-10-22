"""
Chatbot Conversation Models
AI chatbot interaction tracking
"""

from extensions import db
from datetime import datetime


class ChatbotConversation(db.Model):
    """Chatbot conversation sessions"""
    __tablename__ = 'chatbot_conversations'
    
    conversation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    session_id = db.Column(db.String(100), nullable=False, index=True, unique=True)
    language = db.Column(db.String(50), default='English')
    conversation_type = db.Column(db.String(50))  # support, travel_planning, emergency, general
    sentiment = db.Column(db.String(20))  # positive, neutral, negative
    was_helpful = db.Column(db.Boolean)
    feedback_rating = db.Column(db.Integer)  # 1-5
    feedback_text = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='conversation', lazy='dynamic', cascade='all, delete-orphan', order_by='ChatMessage.created_at')
    
    @property
    def duration_minutes(self):
        """Calculate conversation duration"""
        end_time = self.ended_at or datetime.utcnow()
        delta = end_time - self.started_at
        return int(delta.total_seconds() / 60)
    
    @property
    def message_count(self):
        """Get total message count"""
        return self.messages.count()
    
    @property
    def is_active(self):
        """Check if conversation is active"""
        if self.ended_at:
            return False
        # Consider inactive if no activity for 30 minutes
        inactive_threshold = datetime.utcnow() - timedelta(minutes=30)
        return self.last_activity > inactive_threshold
    
    def __repr__(self):
        return f'<ChatbotConversation {self.conversation_id}>'


class ChatMessage(db.Model):
    """Individual chat messages"""
    __tablename__ = 'chat_messages'
    
    message_id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('chatbot_conversations.conversation_id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # user or bot
    message_text = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='text')  # text, image, location, quick_reply
    metadata = db.Column(db.Text)  # JSON for additional data
    intent_detected = db.Column(db.String(100))  # For bot messages
    confidence_score = db.Column(db.Float)  # AI confidence
    response_time_ms = db.Column(db.Integer)  # Response generation time
    was_fallback = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChatMessage {self.message_id} from {self.sender}>'


class ChatbotKnowledge(db.Model):
    """Knowledge base for chatbot"""
    __tablename__ = 'chatbot_knowledge'
    
    knowledge_id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False, index=True)  # faq, travel_tips, safety, booking
    question = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.Text)  # JSON array of keywords
    language = db.Column(db.String(50), default='English')
    priority = db.Column(db.Integer, default=0)  # Higher = more important
    usage_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChatbotKnowledge {self.knowledge_id}>'
