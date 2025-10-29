from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.trips.models import Trip, TripMember
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create sample users
        if not User.objects.filter(username='demo').exists():
            demo_user = User.objects.create_user(
                username='demo',
                email='demo@yatrasecure.com',
                password='demo1234',
                travel_vibe='adventure',
                is_profile_complete=True
            )
            self.stdout.write(self.style.SUCCESS('Created demo user'))
        else:
            demo_user = User.objects.get(username='demo')
        
        # Create sample trip
        if not Trip.objects.filter(name='Goa Beach Adventure').exists():
            trip = Trip.objects.create(
                name='Goa Beach Adventure',
                origin='Delhi',
                destination='Goa',
                start_date=datetime.now().date() + timedelta(days=30),
                end_date=datetime.now().date() + timedelta(days=35),
                budget=25000,
                trip_type='beach',
                status='planning',
                creator=demo_user,
                description='Relaxing beach vacation with water sports and nightlife'
            )
            
            TripMember.objects.create(
                trip=trip,
                user=demo_user,
                role='creator'
            )
            
            self.stdout.write(self.style.SUCCESS('Created sample trip'))
        
        self.stdout.write(self.style.SUCCESS('Seeding completed!'))
