"""
Models package initialization
Import all models here for easy access and circular import prevention
"""

# User and Trip models
from models.user import User, Trip, TripMember, Itinerary, Expense, ExpenseSplit

# Provider and Booking models
from models.provider import ServiceProvider, Service, Booking, ServiceReview

# Safety models
from models.safety import SafetyAlert, CommunityReport, SafetyScore, TravelAdvisory

# Emergency models
from models.emergency import EmergencyContact, SOSAlert, EmergencyCheckIn

# Cultural models
from models.cultural import CulturalInfo, LocalCustom, LanguagePhrase, FestivalInfo

# Circuit models
from models.circuit import TouristCircuit, CircuitDestination, PopularDestination

# Chatbot models
from models.chatbot import ChatbotConversation, ChatMessage, ChatbotKnowledge

# Analytics models
from models.analytics import UserActivity, SearchLog, PageView, SystemMetric, ErrorLog


# Export all models
__all__ = [
    # User & Trip
    'User', 'Trip', 'TripMember', 'Itinerary', 'Expense', 'ExpenseSplit',
    
    # Provider & Booking
    'ServiceProvider', 'Service', 'Booking', 'ServiceReview',
    
    # Safety
    'SafetyAlert', 'CommunityReport', 'SafetyScore', 'TravelAdvisory',
    
    # Emergency
    'EmergencyContact', 'SOSAlert', 'EmergencyCheckIn',
    
    # Cultural
    'CulturalInfo', 'LocalCustom', 'LanguagePhrase', 'FestivalInfo',
    
    # Circuit
    'TouristCircuit', 'CircuitDestination', 'PopularDestination',
    
    # Chatbot
    'ChatbotConversation', 'ChatMessage', 'ChatbotKnowledge',
    
    # Analytics
    'UserActivity', 'SearchLog', 'PageView', 'SystemMetric', 'ErrorLog'
]
