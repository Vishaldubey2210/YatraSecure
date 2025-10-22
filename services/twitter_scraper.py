"""
Twitter/X scraping service for real-time safety alerts using free methods
"""

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
from app import db
from models.safety import Alert

class TwitterScraper:
    def __init__(self):
        """Initialize Twitter scraper"""
        self.base_url = "https://nitter.net"  # Free Twitter frontend
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape_location_alerts(self, location, keywords=None):
        """
        Scrape Twitter for location-based alerts
        
        Args:
            location (str): Location to monitor
            keywords (list): Keywords to search for (default: safety-related)
        
        Returns:
            list: List of alerts found
        """
        if keywords is None:
            keywords = ['protest', 'traffic', 'accident', 'alert', 'warning', 'closed', 'emergency']
        
        alerts = []
        
        try:
            # Build search query
            search_query = f"{location} " + " OR ".join(keywords)
            search_url = f"{self.base_url}/search?f=tweets&q={search_query}"
            
            response = requests.get(search_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                tweets = soup.find_all('div', class_='timeline-item')
                
                for tweet in tweets[:10]:  # Limit to 10 recent tweets
                    try:
                        text = tweet.find('div', class_='tweet-content').get_text(strip=True)
                        timestamp_elem = tweet.find('span', class_='tweet-date')
                        
                        # Analyze tweet sentiment and categorize
                        alert_data = self._analyze_tweet(text, location)
                        
                        if alert_data:
                            alerts.append(alert_data)
                    
                    except AttributeError:
                        continue
        
        except Exception as e:
            print(f"Twitter scraping error: {e}")
        
        return alerts
    
    def _analyze_tweet(self, text, location):
        """
        Analyze tweet text and categorize alert
        
        Args:
            text (str): Tweet text
            location (str): Location
        
        Returns:
            dict: Alert data or None
        """
        text_lower = text.lower()
        
        # Protest/Political
        if any(word in text_lower for word in ['protest', 'rally', 'demonstration', 'strike', 'bandh']):
            return {
                'type': 'protest',
                'severity': 'warning',
                'title': f'Protest/Rally Activity in {location}',
                'description': text[:500],
                'source': 'twitter'
            }
        
        # Traffic
        if any(word in text_lower for word in ['traffic', 'jam', 'congestion', 'blocked', 'diverted']):
            return {
                'type': 'traffic',
                'severity': 'info',
                'title': f'Traffic Alert - {location}',
                'description': text[:500],
                'source': 'twitter'
            }
        
        # Weather
        if any(word in text_lower for word in ['rain', 'flood', 'storm', 'cyclone', 'weather', 'heavy']):
            return {
                'type': 'weather',
                'severity': 'warning',
                'title': f'Weather Alert - {location}',
                'description': text[:500],
                'source': 'twitter'
            }
        
        # Crime/Safety
        if any(word in text_lower for word in ['theft', 'robbery', 'unsafe', 'danger', 'attack', 'crime']):
            return {
                'type': 'crime',
                'severity': 'warning',
                'title': f'Safety Alert - {location}',
                'description': text[:500],
                'source': 'twitter'
            }
        
        return None
    
    def save_alerts_to_db(self, location, state=None):
        """
        Scrape and save alerts to database
        
        Args:
            location (str): Location name
            state (str): State name
        
        Returns:
            int: Number of new alerts saved
        """
        alerts = self.scrape_location_alerts(location)
        saved_count = 0
        
        for alert_data in alerts:
            try:
                # Check if similar alert exists in last 24 hours
                existing = Alert.query.filter(
                    Alert.location == location,
                    Alert.alert_type == alert_data['type'],
                    Alert.created_at >= datetime.utcnow() - timedelta(hours=24)
                ).first()
                
                if not existing:
                    alert = Alert(
                        alert_type=alert_data['type'],
                        location=location,
                        state=state,
                        severity=alert_data['severity'],
                        title=alert_data['title'],
                        description=alert_data['description'],
                        source=alert_data['source'],
                        valid_until=datetime.utcnow() + timedelta(hours=24)
                    )
                    db.session.add(alert)
                    saved_count += 1
            
            except Exception as e:
                print(f"Error saving alert: {e}")
                continue
        
        if saved_count > 0:
            db.session.commit()
        
        return saved_count
    
    def get_trending_safety_topics(self, location):
        """
        Get trending safety-related topics for a location
        
        Args:
            location (str): Location name
        
        Returns:
            list: Trending topics
        """
        topics = []
        
        try:
            search_url = f"{self.base_url}/search?f=tweets&q={location} safety OR alert OR warning"
            response = requests.get(search_url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract hashtags
                hashtags = soup.find_all('a', class_='hashtag')
                for tag in hashtags[:5]:
                    topics.append(tag.get_text(strip=True))
        
        except Exception as e:
            print(f"Error getting trending topics: {e}")
        
        return topics


# Alternative: RSS Feed Parser (if Twitter scraping fails)
class NewsRSSParser:
    """Parse news RSS feeds for safety alerts"""
    
    def __init__(self):
        self.news_feeds = {
            'national': 'https://news.google.com/rss/search?q=india+travel+safety&hl=en-IN',
            'weather': 'https://weather.com/en-IN/rss/india'
        }
    
    def get_safety_news(self, location):
        """
        Get safety-related news from RSS feeds
        
        Args:
            location (str): Location name
        
        Returns:
            list: News items
        """
        news_items = []
        
        try:
            import feedparser
            
            search_url = f"https://news.google.com/rss/search?q={location}+safety+OR+alert&hl=en-IN"
            feed = feedparser.parse(search_url)
            
            for entry in feed.entries[:5]:
                news_items.append({
                    'title': entry.title,
                    'description': entry.get('summary', ''),
                    'link': entry.link,
                    'published': entry.get('published', '')
                })
        
        except Exception as e:
            print(f"RSS parsing error: {e}")
        
        return news_items


# Singleton instances
_twitter_scraper = None
_rss_parser = None

def get_twitter_scraper():
    """Get or create Twitter scraper instance"""
    global _twitter_scraper
    if _twitter_scraper is None:
        _twitter_scraper = TwitterScraper()
    return _twitter_scraper

def get_rss_parser():
    """Get or create RSS parser instance"""
    global _rss_parser
    if _rss_parser is None:
        _rss_parser = NewsRSSParser()
    return _rss_parser
