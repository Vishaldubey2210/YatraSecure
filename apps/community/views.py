from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from apps.trips.models import Trip
from django.db.models import Q, Count

User = get_user_model()


@login_required
def discover_view(request):
    """Discover travelers and trips"""
    
    # Get similar travelers based on travel vibe
    similar_users = []
    
    if hasattr(request.user, 'travel_vibe') and request.user.travel_vibe:
        similar_users = User.objects.filter(
            travel_vibe=request.user.travel_vibe
        ).exclude(id=request.user.id)[:6]
    
    if not similar_users:
        # Get any active users
        similar_users = User.objects.filter(
            is_active=True
        ).exclude(id=request.user.id).order_by('?')[:6]
    
    # Get public trips WITHOUT annotating member_count (use property instead)
    try:
        public_trips = Trip.objects.filter(
            is_public=True,
            status='planning'
        ).exclude(
            members=request.user
        ).select_related('creator')[:6]
    except Exception as e:
        print(f"Error fetching public trips: {e}")
        public_trips = []
    
    context = {
        'similar_users': similar_users,
        'public_trips': public_trips,
    }
    return render(request, 'community/discover.html', context)


@login_required
def leaderboard_view(request):
    """Community leaderboard with top travelers"""
    
    # Get top travelers by trip count
    top_travelers = User.objects.annotate(
        trip_count=Count('created_trips')
    ).filter(
        is_active=True
    ).order_by('-trip_count')[:20]
    
    # Get user's rank
    user_trip_count = request.user.created_trips.count()
    higher_ranked = User.objects.annotate(
        trip_count=Count('created_trips')
    ).filter(
        trip_count__gt=user_trip_count,
        is_active=True
    ).count()
    
    user_rank = higher_ranked + 1
    
    context = {
        'top_travelers': top_travelers,
        'user_rank': user_rank,
    }
    return render(request, 'community/leaderboard.html', context)
