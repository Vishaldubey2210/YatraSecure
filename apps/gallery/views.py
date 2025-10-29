from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from apps.trips.models import Trip
from .models import TripPhoto, PhotoLike, PhotoComment

@login_required
def gallery_view(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    photos = TripPhoto.objects.filter(trip=trip).select_related('uploaded_by')
    
    context = {
        'trip': trip,
        'photos': photos,
    }
    return render(request, 'gallery/gallery.html', context)

@login_required
def upload_photo(request, trip_id):
    trip = get_object_or_404(Trip, id=trip_id)
    
    if not trip.members.filter(id=request.user.id).exists():
        messages.error(request, 'Access denied.')
        return redirect('trips:trip_list')
    
    if request.method == 'POST':
        caption = request.POST.get('caption', '')
        location = request.POST.get('location', '')
        images = request.FILES.getlist('images')
        
        for image in images:
            TripPhoto.objects.create(
                trip=trip,
                uploaded_by=request.user,
                image=image,
                caption=caption,
                location=location
            )
        
        messages.success(request, f'{len(images)} photo(s) uploaded successfully!')
        return redirect('gallery:gallery', trip_id=trip.id)
    
    context = {'trip': trip}
    return render(request, 'gallery/upload.html', context)

@login_required
def like_photo(request, photo_id):
    photo = get_object_or_404(TripPhoto, id=photo_id)
    
    like, created = PhotoLike.objects.get_or_create(photo=photo, user=request.user)
    
    if not created:
        like.delete()
        liked = False
    else:
        liked = True
    
    return JsonResponse({
        'liked': liked,
        'likes_count': photo.likes.count()
    })

@login_required
def add_comment(request, photo_id):
    if request.method == 'POST':
        photo = get_object_or_404(TripPhoto, id=photo_id)
        text = request.POST.get('text', '')
        
        if text:
            comment = PhotoComment.objects.create(
                photo=photo,
                user=request.user,
                text=text
            )
            return JsonResponse({
                'status': 'success',
                'comment': {
                    'user': request.user.username,
                    'text': text,
                    'timestamp': comment.created_at.strftime('%I:%M %p')
                }
            })
    
    return JsonResponse({'status': 'error'})
