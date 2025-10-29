"""
Root API Views
Safety Score API endpoint
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime


@csrf_exempt
def safety_score_api(request):
    """
    Safety score API endpoint
    GET /api/safety-score/?lat=28.7&lon=77.5
    
    Returns:
        JSON with safety score and recommendations
    """
    if request.method == 'GET':
        try:
            lat = float(request.GET.get('lat', 0))
            lon = float(request.GET.get('lon', 0))
            
            if lat == 0 or lon == 0:
                return JsonResponse({
                    'error': 'Invalid coordinates',
                    'safety_score': 6,
                    'safety_level': 'moderate'
                }, status=400)
            
            # Get current hour
            hour = datetime.now().hour
            
            # Import ML service
            try:
                from apps.ai_assistant.ml_service import get_ml_service
                ml_service = get_ml_service()
                result = ml_service.predict_safety(lat, lon, hour)
            except Exception as e:
                print(f"ML Service error: {e}")
                # Fallback response
                result = {
                    'safety_score': 6.5,
                    'safety_level': 'moderate',
                    'color': 'yellow',
                    'recommendations': [
                        "⚠️ Be cautious in crowded areas",
                        "⚠️ Avoid isolated areas after dark",
                    ]
                }
            
            return JsonResponse({
                'success': True,
                'latitude': lat,
                'longitude': lon,
                'hour': hour,
                'timestamp': datetime.now().isoformat(),
                **result
            })
            
        except Exception as e:
            print(f"Safety API Error: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e),
                'safety_score': 6,
                'safety_level': 'moderate',
                'color': 'yellow'
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
