from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy community members for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy community members...')
        
        dummy_profiles = [
            {
                'username': 'adventure_seeker',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'email': 'rahul@example.com',
                'travel_vibe': 'adventure',
                'bio': 'Mountain lover | Trek enthusiast | Exploring Himalayas 🏔️',
                'points': 850
            },
            {
                'username': 'beach_wanderer',
                'first_name': 'Priya',
                'last_name': 'Patel',
                'email': 'priya@example.com',
                'travel_vibe': 'beach',
                'bio': 'Beach vibes only 🏖️ | Sunset chaser | Goa lover',
                'points': 720
            },
            {
                'username': 'culture_explorer',
                'first_name': 'Amit',
                'last_name': 'Kumar',
                'email': 'amit@example.com',
                'travel_vibe': 'cultural',
                'bio': 'Heritage explorer | History buff | UNESCO sites collector 🏛️',
                'points': 690
            },
            {
                'username': 'wildlife_hunter',
                'first_name': 'Neha',
                'last_name': 'Singh',
                'email': 'neha@example.com',
                'travel_vibe': 'wildlife',
                'bio': 'Wildlife photographer 📸 | Safari expert | Nature lover 🦁',
                'points': 780
            },
            {
                'username': 'spiritual_soul',
                'first_name': 'Vikram',
                'last_name': 'Joshi',
                'email': 'vikram@example.com',
                'travel_vibe': 'pilgrimage',
                'bio': 'Spiritual journeys | Temple hopper | Peace seeker 🕉️',
                'points': 650
            },
            {
                'username': 'foodie_traveler',
                'first_name': 'Anjali',
                'last_name': 'Verma',
                'email': 'anjali@example.com',
                'travel_vibe': 'cultural',
                'bio': 'Food + Travel = Life 🍛 | Street food expert | Recipe collector',
                'points': 710
            },
            {
                'username': 'solo_backpacker',
                'first_name': 'Rohan',
                'last_name': 'Mehta',
                'email': 'rohan@example.com',
                'travel_vibe': 'adventure',
                'bio': 'Solo backpacker ⛺ | Budget traveler | 25 states explored',
                'points': 920
            },
            {
                'username': 'luxury_traveler',
                'first_name': 'Kavya',
                'last_name': 'Reddy',
                'email': 'kavya@example.com',
                'travel_vibe': 'luxury',
                'bio': 'Luxury travel enthusiast ✨ | 5-star experiences | Travel blogger',
                'points': 800
            },
        ]
        
        created_count = 0
        for profile in dummy_profiles:
            if not User.objects.filter(username=profile['username']).exists():
                user = User.objects.create_user(
                    username=profile['username'],
                    email=profile['email'],
                    password='demo1234',
                    first_name=profile['first_name'],
                    last_name=profile['last_name'],
                    travel_vibe=profile['travel_vibe'],
                    bio=profile['bio'],
                    is_profile_complete=True,
                    points=profile['points']
                )
                created_count += 1
                self.stdout.write(f'  ✅ Created: @{user.username}')
            else:
                self.stdout.write(f'  ⚠️ Already exists: @{profile["username"]}')
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {created_count} dummy users!'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ All dummy users already exist'))
