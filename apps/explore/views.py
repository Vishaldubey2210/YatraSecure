from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Count
from .models import Place, PlacePhoto, PhotoLike, PlaceComment


def explore_home(request):
    """Main explore page - Instagram style grid"""
    # Get trending places
    trending_places = Place.objects.annotate(
        photo_count=Count('photos')
    ).filter(photo_count__gt=0).order_by('-view_count', '-rating')[:12]
    
    # Get recent photos
    recent_photos = PlacePhoto.objects.all().select_related('place', 'user')[:50]
    
    # Get popular categories
    categories = Place.CATEGORY_CHOICES
    
    context = {
        'trending_places': trending_places,
        'recent_photos': recent_photos,
        'categories': categories,
    }
    return render(request, 'explore/explore_home.html', context)


def search_places(request):
    """Search places"""
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    state = request.GET.get('state', '')
    
    places = Place.objects.all()
    
    if query:
        places = places.filter(
            Q(name__icontains=query) |
            Q(city__icontains=query) |
            Q(state__icontains=query) |
            Q(description__icontains=query)
        )
    
    if category:
        places = places.filter(category=category)
    
    if state:
        places = places.filter(state__icontains=state)
    
    places = places.annotate(photo_count=Count('photos')).order_by('-photo_count', '-rating')
    
    context = {
        'places': places,
        'query': query,
        'category': category,
        'state': state,
        'categories': Place.CATEGORY_CHOICES,
    }
    return render(request, 'explore/search_results.html', context)


def place_detail(request, place_id):
    """Place detail with photos - Instagram style"""
    place = get_object_or_404(Place, id=place_id)
    
    # Increment view count
    place.view_count += 1
    place.save(update_fields=['view_count'])
    
    # Get all photos for this place
    photos = place.photos.all().select_related('user').prefetch_related('likes', 'comments')
    
    # Check which photos current user has liked
    liked_photo_ids = []
    if request.user.is_authenticated:
        liked_photo_ids = PhotoLike.objects.filter(
            photo__in=photos,
            user=request.user
        ).values_list('photo_id', flat=True)
    
    context = {
        'place': place,
        'photos': photos,
        'liked_photo_ids': liked_photo_ids,
    }
    return render(request, 'explore/place_detail.html', context)


@login_required
def upload_photo(request, place_id):
    """Upload photo to a place"""
    place = get_object_or_404(Place, id=place_id)
    
    if request.method == 'POST':
        image = request.FILES.get('image')
        caption = request.POST.get('caption', '')
        
        if image:
            PlacePhoto.objects.create(
                place=place,
                user=request.user,
                image=image,
                caption=caption
            )
            messages.success(request, 'Photo uploaded successfully!')
            return redirect('explore:place_detail', place_id=place_id)
        else:
            messages.error(request, 'Please select an image.')
    
    context = {'place': place}
    return render(request, 'explore/upload_photo.html', context)


@login_required
def like_photo(request, photo_id):
    """Like/unlike a photo"""
    if request.method == 'POST':
        photo = get_object_or_404(PlacePhoto, id=photo_id)
        
        like, created = PhotoLike.objects.get_or_create(
            photo=photo,
            user=request.user
        )
        
        if not created:
            # Unlike
            like.delete()
            photo.likes_count -= 1
            photo.save(update_fields=['likes_count'])
            liked = False
        else:
            # Like
            photo.likes_count += 1
            photo.save(update_fields=['likes_count'])
            liked = True
        
        return JsonResponse({
            'status': 'success',
            'liked': liked,
            'likes_count': photo.likes_count
        })
    
    return JsonResponse({'error': 'Invalid request'}, status=400)


@login_required
def add_comment(request, photo_id):
    """Add comment to photo"""
    if request.method == 'POST':
        photo = get_object_or_404(PlacePhoto, id=photo_id)
        text = request.POST.get('text', '').strip()
        
        if text:
            comment = PlaceComment.objects.create(
                photo=photo,
                user=request.user,
                text=text
            )
            
            return JsonResponse({
                'status': 'success',
                'comment': {
                    'id': comment.id,
                    'user': comment.user.username,
                    'text': comment.text,
                    'created_at': comment.created_at.strftime('%B %d, %Y')
                }
            })
        
        return JsonResponse({'error': 'Comment text required'}, status=400)
    
    return JsonResponse({'error': 'Invalid request'}, status=400)
