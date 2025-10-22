"""
Cultural Information Models
Cultural tips and local customs for travelers
"""

from extensions import db
from datetime import datetime
import json


class CulturalInfo(db.Model):
    """Cultural information for different states"""
    __tablename__ = 'cultural_info'
    
    info_id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    region = db.Column(db.String(100))
    category = db.Column(db.String(50), nullable=False)  # customs, festivals, food, language, dress, etiquette
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    do_list = db.Column(db.Text)  # JSON array of dos
    dont_list = db.Column(db.Text)  # JSON array of don'ts
    tips = db.Column(db.Text)  # JSON array of useful tips
    seasonal_info = db.Column(db.Text)  # JSON object of seasonal variations
    importance_level = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    images = db.Column(db.Text)  # JSON array of image URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def dos(self):
        """Get list of dos"""
        try:
            return json.loads(self.do_list) if self.do_list else []
        except:
            return []
    
    @property
    def donts(self):
        """Get list of don'ts"""
        try:
            return json.loads(self.dont_list) if self.dont_list else []
        except:
            return []
    
    @property
    def helpful_tips(self):
        """Get list of tips"""
        try:
            return json.loads(self.tips) if self.tips else []
        except:
            return []
    
    def __repr__(self):
        return f'<CulturalInfo {self.state} - {self.title}>'


class LocalCustom(db.Model):
    """Specific local customs and traditions"""
    __tablename__ = 'local_customs'
    
    custom_id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # greeting, dining, religious, social
    when_applicable = db.Column(db.String(200))  # Always, During festivals, etc.
    sensitivity_level = db.Column(db.String(20), default='medium')  # low, medium, high
    tips = db.Column(db.Text)
    examples = db.Column(db.Text)  # JSON array of examples
    common_mistakes = db.Column(db.Text)  # JSON array of mistakes to avoid
    is_mandatory = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<LocalCustom {self.location} - {self.title}>'


class LanguagePhrase(db.Model):
    """Common phrases in local languages"""
    __tablename__ = 'language_phrases'
    
    phrase_id = db.Column(db.Integer, primary_key=True)
    language = db.Column(db.String(50), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    category = db.Column(db.String(50))  # greeting, emergency, food, direction, shopping
    english_phrase = db.Column(db.String(200), nullable=False)
    local_phrase = db.Column(db.String(200), nullable=False)
    pronunciation = db.Column(db.String(200))
    context = db.Column(db.String(200))  # When to use
    formality_level = db.Column(db.String(20))  # casual, formal, very_formal
    audio_url = db.Column(db.String(300))
    usage_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<LanguagePhrase {self.language} - {self.english_phrase}>'


class FestivalInfo(db.Model):
    """Information about local festivals"""
    __tablename__ = 'festivals'
    
    festival_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    state = db.Column(db.String(100), nullable=False, index=True)
    region = db.Column(db.String(100))
    description = db.Column(db.Text)
    significance = db.Column(db.Text)
    typical_dates = db.Column(db.String(200))  # Month or date range
    duration_days = db.Column(db.Integer)
    activities = db.Column(db.Text)  # JSON array of activities
    what_to_expect = db.Column(db.Text)
    participation_tips = db.Column(db.Text)  # JSON array
    dress_code = db.Column(db.String(200))
    is_public_holiday = db.Column(db.Boolean, default=False)
    crowd_level = db.Column(db.String(20))  # low, medium, high, very_high
    images = db.Column(db.Text)  # JSON array
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<FestivalInfo {self.name} - {self.state}>'
