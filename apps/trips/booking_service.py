from .booking_scraper import scraper


def search_flights(origin, destination, date, budget_range=None):
    """Search flights using real-time scraper"""
    # Use real scraper
    flights = scraper.scrape_flights(origin, destination, date)
    
    # Filter by budget if provided
    if budget_range:
        min_price, max_price = budget_range
        flights = [f for f in flights if min_price <= f['price'] <= max_price]
    
    # Sort by price
    flights.sort(key=lambda x: x['price'])
    
    return flights


def search_trains(origin, destination, date, budget_range=None):
    """Search trains using real-time scraper"""
    trains = scraper.scrape_trains(origin, destination, date)
    
    if budget_range:
        min_price, max_price = budget_range
        trains = [t for t in trains if min_price <= t['price'] <= max_price]
    
    trains.sort(key=lambda x: x['price'])
    
    return trains


def search_cabs(pickup, dropoff, date, budget_range=None):
    """Search cabs using real-time scraper"""
    cabs = scraper.scrape_cabs(pickup, dropoff, date)
    
    if budget_range:
        min_price, max_price = budget_range
        cabs = [c for c in cabs if min_price <= c['price'] <= max_price]
    
    cabs.sort(key=lambda x: x['price'])
    
    return cabs


def search_hotels(location, checkin, checkout, budget_range=None):
    """Search hotels using real-time scraper"""
    hotels = scraper.scrape_hotels(location, checkin, checkout)
    
    if budget_range:
        min_price, max_price = budget_range
        hotels = [h for h in hotels if min_price <= h['price'] <= max_price]
    
    hotels.sort(key=lambda x: x['price'])
    
    return hotels


def search_restaurants(location, cuisine=None, budget_range=None):
    """Search restaurants using real-time scraper"""
    restaurants = scraper.scrape_restaurants(location, cuisine)
    
    if budget_range:
        min_price, max_price = budget_range
        restaurants = [r for r in restaurants if min_price <= r['price'] <= max_price]
    
    restaurants.sort(key=lambda x: x['price'])
    
    return restaurants


def get_deal_details(provider, booking_type, item_id=None):
    """
    Get detailed information about a specific deal
    This can be used to show more details before booking
    """
    # Placeholder for detailed scraping
    return {
        'status': 'success',
        'message': 'Deal details fetched',
        'provider': provider,
        'type': booking_type
    }


def compare_prices(results):
    """
    Compare prices across different providers
    Returns price comparison and best deal
    """
    if not results:
        return None
    
    min_price = min(r['price'] for r in results)
    max_price = max(r['price'] for r in results)
    avg_price = sum(r['price'] for r in results) / len(results)
    
    best_deal = min(results, key=lambda x: x['price'])
    
    return {
        'min_price': min_price,
        'max_price': max_price,
        'avg_price': avg_price,
        'best_deal': best_deal,
        'total_options': len(results)
    }
