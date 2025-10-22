"""
Gemini AI Chatbot service for travel assistance
"""

import google.generativeai as genai
from flask import current_app
import os

class GeminiChatbot:
    def __init__(self):
        """Initialize Gemini AI with API key"""
        api_key = current_app.config.get('GEMINI_API_KEY') or os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
    
    def get_response(self, user_message, context=None):
        """
        Get chatbot response for user query
        
        Args:
            user_message (str): User's question
            context (dict): Additional context (location, trip details, etc.)
        
        Returns:
            str: AI response
        """
        if not self.model:
            return "Chatbot service is currently unavailable. Please check your API configuration."
        
        try:
            # Build system prompt with context
            system_prompt = self._build_system_prompt(context)
            
            # Combine system prompt with user message
            full_prompt = f"{system_prompt}\n\nUser Query: {user_message}\n\nResponse:"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            return response.text
        
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm having trouble processing your request right now. Please try again later."
    
    def _build_system_prompt(self, context):
        """Build system prompt based on context"""
        base_prompt = """You are YatraSecure Travel Assistant, an AI companion for travelers in India. 
        You provide helpful, accurate, and safety-focused travel advice.
        
        Your capabilities:
        - Answer travel-related questions about destinations in India
        - Provide safety tips and precautions
        - Suggest itineraries and activities
        - Share cultural etiquette and local customs
        - Help with emergency situations
        - Give budget-friendly recommendations
        
        Always prioritize traveler safety and provide practical, actionable advice.
        Keep responses concise (2-3 paragraphs max) and friendly.
        """
        
        if context:
            if context.get('location'):
                base_prompt += f"\n\nCurrent user location: {context['location']}"
            
            if context.get('trip_destination'):
                base_prompt += f"\nUser is planning a trip to: {context['trip_destination']}"
            
            if context.get('budget'):
                base_prompt += f"\nUser's budget: ₹{context['budget']}"
            
            if context.get('is_premium'):
                base_prompt += "\nUser has premium subscription - provide detailed recommendations."
        
        return base_prompt
    
    def get_itinerary_suggestions(self, destination, duration_days, budget, interests=None):
        """
        Generate AI-powered itinerary suggestions
        
        Args:
            destination (str): Travel destination
            duration_days (int): Trip duration
            budget (float): Total budget in INR
            interests (list): User interests (e.g., ['adventure', 'culture', 'food'])
        
        Returns:
            str: Detailed itinerary suggestions
        """
        if not self.model:
            return "Itinerary generation service is unavailable."
        
        try:
            interests_str = ', '.join(interests) if interests else 'general sightseeing'
            
            prompt = f"""Create a detailed {duration_days}-day itinerary for {destination}, India.
            
            Requirements:
            - Total budget: ₹{budget:,.0f}
            - Interests: {interests_str}
            - Include daily activities, estimated costs, and safety tips
            - Recommend specific places to visit, eat, and stay
            - Suggest best transportation options
            - Highlight safety considerations
            
            Format the response as:
            Day 1: [Date]
            Morning: [Activity] - [Cost estimate]
            Afternoon: [Activity] - [Cost estimate]
            Evening: [Activity] - [Cost estimate]
            Safety Tip: [Tip]
            
            (Continue for all days)
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            print(f"Itinerary generation error: {e}")
            return "Unable to generate itinerary at this time."
    
    def get_safety_advice(self, location, situation_type=None):
        """
        Get location-specific safety advice
        
        Args:
            location (str): Location name
            situation_type (str): Specific situation (e.g., 'solo_female', 'night_travel')
        
        Returns:
            str: Safety recommendations
        """
        if not self.model:
            return "Safety advice service is unavailable."
        
        try:
            situation_context = f" for {situation_type}" if situation_type else ""
            
            prompt = f"""Provide comprehensive safety advice for travelers visiting {location}, India{situation_context}.
            
            Include:
            1. General safety precautions (2-3 points)
            2. Areas to avoid or be cautious in
            3. Common scams targeting tourists
            4. Emergency contact numbers
            5. Cultural sensitivities to respect
            
            Keep the response practical and actionable.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            print(f"Safety advice error: {e}")
            return "Unable to retrieve safety advice at this time."
    
    def get_scam_prevention(self, city):
        """
        Get city-specific scam prevention tips
        
        Args:
            city (str): City name
        
        Returns:
            str: Scam prevention advice
        """
        if not self.model:
            return "Scam prevention service is unavailable."
        
        try:
            prompt = f"""List the top 5 most common tourist scams in {city}, India and how to avoid them.
            
            Format:
            1. [Scam name]: [Brief description]
            Prevention: [How to avoid]
            
            Keep each entry concise (2-3 sentences).
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            print(f"Scam prevention error: {e}")
            return "Unable to retrieve scam information."
    
    def translate_emergency_phrase(self, phrase, target_language):
        """
        Translate emergency phrases to local languages
        
        Args:
            phrase (str): English phrase to translate
            target_language (str): Target Indian language
        
        Returns:
            str: Translated phrase with pronunciation
        """
        if not self.model:
            return "Translation service is unavailable."
        
        try:
            prompt = f"""Translate this emergency phrase to {target_language}:
            English: "{phrase}"
            
            Provide:
            1. Translation in {target_language} script
            2. Romanized pronunciation (how to say it)
            3. Context when to use this phrase
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        
        except Exception as e:
            print(f"Translation error: {e}")
            return "Translation service temporarily unavailable."


# Singleton instance
_chatbot_instance = None

def get_chatbot():
    """Get or create chatbot instance"""
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = GeminiChatbot()
    return _chatbot_instance
