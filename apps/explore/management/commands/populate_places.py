from django.core.management.base import BaseCommand
from apps.explore.models import Place


class Command(BaseCommand):
    help = 'Populate places with sample Indian tourist destinations'

    def handle(self, *args, **kwargs):
        places_data = [
            # Goa
            {'name': 'Baga Beach', 'city': 'Goa', 'state': 'Goa', 'category': 'beach', 
             'description': 'Famous beach in North Goa known for water sports and nightlife', 
             'latitude': 15.5559, 'longitude': 73.7519, 'best_time_to_visit': 'November to February', 'entry_fee': 0, 'rating': 4.5},
            
            {'name': 'Calangute Beach', 'city': 'Goa', 'state': 'Goa', 'category': 'beach',
             'description': 'Largest beach in North Goa, perfect for sunbathing and water activities',
             'latitude': 15.5434, 'longitude': 73.7554, 'best_time_to_visit': 'October to March', 'entry_fee': 0, 'rating': 4.3},
            
            {'name': 'Dudhsagar Falls', 'city': 'Goa', 'state': 'Goa', 'category': 'waterfall',
             'description': 'Spectacular four-tiered waterfall on the Mandovi River',
             'latitude': 15.3144, 'longitude': 74.3144, 'best_time_to_visit': 'Monsoon', 'entry_fee': 50, 'rating': 4.7},
            
            # Rajasthan
            {'name': 'Amber Fort', 'city': 'Jaipur', 'state': 'Rajasthan', 'category': 'fort',
             'description': 'Majestic fort with stunning architecture and elephant rides',
             'latitude': 26.9855, 'longitude': 75.8513, 'best_time_to_visit': 'October to March', 'entry_fee': 200, 'rating': 4.8},
            
            {'name': 'City Palace Jaipur', 'city': 'Jaipur', 'state': 'Rajasthan', 'category': 'palace',
             'description': 'Royal palace complex with museums and courtyards',
             'latitude': 26.9258, 'longitude': 75.8237, 'best_time_to_visit': 'November to February', 'entry_fee': 500, 'rating': 4.6},
            
            {'name': 'Hawa Mahal', 'city': 'Jaipur', 'state': 'Rajasthan', 'category': 'heritage',
             'description': 'Iconic pink palace with 953 windows',
             'latitude': 26.9239, 'longitude': 75.8267, 'best_time_to_visit': 'October to March', 'entry_fee': 200, 'rating': 4.5},
            
            {'name': 'Jaisalmer Fort', 'city': 'Jaisalmer', 'state': 'Rajasthan', 'category': 'fort',
             'description': 'Living fort in the Thar Desert, UNESCO World Heritage Site',
             'latitude': 26.9124, 'longitude': 70.9124, 'best_time_to_visit': 'November to February', 'entry_fee': 250, 'rating': 4.7},
            
            # Kerala
            {'name': 'Munnar Tea Gardens', 'city': 'Munnar', 'state': 'Kerala', 'category': 'mountain',
             'description': 'Lush tea plantations in the Western Ghats',
             'latitude': 10.0889, 'longitude': 77.0595, 'best_time_to_visit': 'September to May', 'entry_fee': 0, 'rating': 4.6},
            
            {'name': 'Alleppey Backwaters', 'city': 'Alleppey', 'state': 'Kerala', 'category': 'lake',
             'description': 'Serene backwaters perfect for houseboat cruises',
             'latitude': 9.4981, 'longitude': 76.3388, 'best_time_to_visit': 'November to February', 'entry_fee': 0, 'rating': 4.8},
            
            # Himachal Pradesh
            {'name': 'Rohtang Pass', 'city': 'Manali', 'state': 'Himachal Pradesh', 'category': 'mountain',
             'description': 'High mountain pass with stunning snow-capped peaks',
             'latitude': 32.2432, 'longitude': 77.2493, 'best_time_to_visit': 'May to October', 'entry_fee': 50, 'rating': 4.5},
            
            {'name': 'Solang Valley', 'city': 'Manali', 'state': 'Himachal Pradesh', 'category': 'adventure',
             'description': 'Adventure sports paradise with skiing and paragliding',
             'latitude': 32.3080, 'longitude': 77.1481, 'best_time_to_visit': 'October to June', 'entry_fee': 0, 'rating': 4.4},
            
            # Uttarakhand
            {'name': 'Valley of Flowers', 'city': 'Chamoli', 'state': 'Uttarakhand', 'category': 'mountain',
             'description': 'UNESCO site with rare alpine flowers and meadows',
             'latitude': 30.7268, 'longitude': 79.6007, 'best_time_to_visit': 'July to September', 'entry_fee': 150, 'rating': 4.9},
            
            {'name': 'Nainital Lake', 'city': 'Nainital', 'state': 'Uttarakhand', 'category': 'lake',
             'description': 'Beautiful hill station lake surrounded by mountains',
             'latitude': 29.3803, 'longitude': 79.4636, 'best_time_to_visit': 'March to June', 'entry_fee': 0, 'rating': 4.5},
            
            # Tamil Nadu
            {'name': 'Meenakshi Temple', 'city': 'Madurai', 'state': 'Tamil Nadu', 'category': 'temple',
             'description': 'Ancient temple with stunning Dravidian architecture',
             'latitude': 9.9195, 'longitude': 78.1193, 'best_time_to_visit': 'October to March', 'entry_fee': 50, 'rating': 4.8},
            
            {'name': 'Marina Beach', 'city': 'Chennai', 'state': 'Tamil Nadu', 'category': 'beach',
             'description': 'One of the longest urban beaches in the world',
             'latitude': 13.0499, 'longitude': 80.2824, 'best_time_to_visit': 'November to February', 'entry_fee': 0, 'rating': 4.2},
            
            # Maharashtra
            {'name': 'Gateway of India', 'city': 'Mumbai', 'state': 'Maharashtra', 'category': 'heritage',
             'description': 'Iconic monument overlooking the Arabian Sea',
             'latitude': 18.9220, 'longitude': 72.8347, 'best_time_to_visit': 'November to February', 'entry_fee': 0, 'rating': 4.4},
            
            {'name': 'Ajanta Caves', 'city': 'Aurangabad', 'state': 'Maharashtra', 'category': 'heritage',
             'description': 'Ancient Buddhist cave monuments with paintings',
             'latitude': 20.5519, 'longitude': 75.7033, 'best_time_to_visit': 'October to March', 'entry_fee': 600, 'rating': 4.7},
            
            # Karnataka
            {'name': 'Mysore Palace', 'city': 'Mysore', 'state': 'Karnataka', 'category': 'palace',
             'description': 'Royal palace with Indo-Saracenic architecture',
             'latitude': 12.3051, 'longitude': 76.6551, 'best_time_to_visit': 'October to February', 'entry_fee': 70, 'rating': 4.6},
            
            {'name': 'Hampi Ruins', 'city': 'Hampi', 'state': 'Karnataka', 'category': 'heritage',
             'description': 'UNESCO World Heritage Site with ancient temple ruins',
             'latitude': 15.3350, 'longitude': 76.4600, 'best_time_to_visit': 'October to February', 'entry_fee': 600, 'rating': 4.8},
            
            # Delhi
            {'name': 'Qutub Minar', 'city': 'Delhi', 'state': 'Delhi', 'category': 'heritage',
             'description': 'Tallest brick minaret in the world',
             'latitude': 28.5244, 'longitude': 77.1855, 'best_time_to_visit': 'October to March', 'entry_fee': 30, 'rating': 4.5},
            
            {'name': 'India Gate', 'city': 'Delhi', 'state': 'Delhi', 'category': 'heritage',
             'description': 'War memorial and iconic landmark',
             'latitude': 28.6129, 'longitude': 77.2295, 'best_time_to_visit': 'November to February', 'entry_fee': 0, 'rating': 4.4},
            
            # Agra
            {'name': 'Taj Mahal', 'city': 'Agra', 'state': 'Uttar Pradesh', 'category': 'heritage',
             'description': 'Iconic white marble mausoleum and Wonder of the World',
             'latitude': 27.1751, 'longitude': 78.0421, 'best_time_to_visit': 'October to March', 'entry_fee': 1300, 'rating': 5.0},
            
            {'name': 'Agra Fort', 'city': 'Agra', 'state': 'Uttar Pradesh', 'category': 'fort',
             'description': 'Red sandstone fort with Mughal architecture',
             'latitude': 27.1795, 'longitude': 78.0211, 'best_time_to_visit': 'October to March', 'entry_fee': 650, 'rating': 4.6},
        ]
        
        created_count = 0
        for place_data in places_data:
            place, created = Place.objects.get_or_create(
                name=place_data['name'],
                city=place_data['city'],
                defaults=place_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Created: {place.name}, {place.city}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️  Already exists: {place.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Done! Created {created_count} new places'))
