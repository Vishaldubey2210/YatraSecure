from django.core.management.base import BaseCommand
from apps.trips.models import Trip, TripMember
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy public trips for community'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy public trips...')
        
        # Get some users
        users = User.objects.all()[:5]
        
        if not users:
            self.stdout.write(self.style.ERROR('No users found. Create users first!'))
            return
        
        dummy_trips = [
            {
                'name': 'Goa Beach Party 2025',
                'origin': 'Mumbai',
                'destination': 'Goa',
                'days': 5,
                'budget': 15000,
                'trip_type': 'beach',
                'description': 'Beach party with water sports and nightlife! 🏖️',
            },
            {
                'name': 'Manali Snow Trek',
                'origin': 'Delhi',
                'destination': 'Manali',
                'days': 7,
                'budget': 20000,
                'trip_type': 'adventure',
                'description': 'Mountain trekking and snow activities in Himalayas ⛰️',
            },
            {
                'name': 'Kerala Backwaters Tour',
                'origin': 'Bangalore',
                'destination': 'Kerala',
                'days': 4,
                'budget': 12000,
                'trip_type': 'cultural',
                'description': 'Houseboat experience and traditional Kerala cuisine 🚢',
            },
            {
                'name': 'Rajasthan Heritage Tour',
                'origin': 'Jaipur',
                'destination': 'Udaipur',
                'days': 6,
                'budget': 18000,
                'trip_type': 'cultural',
                'description': 'Explore palaces, forts and royal heritage of Rajasthan 🏰',
            },
            {
                'name': 'Jim Corbett Wildlife Safari',
                'origin': 'Delhi',
                'destination': 'Jim Corbett',
                'days': 3,
                'budget': 10000,
                'trip_type': 'wildlife',
                'description': 'Wildlife photography and jungle safari 🐯',
            },
        ]
        
        created = 0
        for trip_data in dummy_trips:
            start_date = datetime.now().date() + timedelta(days=random.randint(10, 60))
            end_date = start_date + timedelta(days=trip_data['days'])
            
            # Generate unique trip code
            trip_code = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))
            
            creator = random.choice(users)
            
            trip, created_flag = Trip.objects.get_or_create(
                name=trip_data['name'],
                defaults={
                    'origin': trip_data['origin'],
                    'destination': trip_data['destination'],
                    'start_date': start_date,
                    'end_date': end_date,
                    'budget': trip_data['budget'],
                    'trip_type': trip_data['trip_type'],
                    'description': trip_data['description'],
                    'trip_code': trip_code,
                    'creator': creator,
                    'is_public': True,
                    'status': 'planning'
                }
            )
            
            if created_flag:
                # Add creator as member
                TripMember.objects.get_or_create(
                    trip=trip,
                    user=creator,
                    defaults={'role': 'creator'}
                )
                created += 1
                self.stdout.write(f'  ✅ Created: {trip.name}')
        
        if created > 0:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {created} public trips!'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ All trips already exist'))
