"""
YatraSecure URL Configuration
Main URL routing for the entire project
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Core Apps
    path('', include('apps.dashboard.urls', namespace='dashboard')),
    path('accounts/', include('apps.accounts.urls', namespace='accounts')),
    path('trips/', include('apps.trips.urls', namespace='trips')),
    path('expenses/', include('apps.expenses.urls', namespace='expenses')),
    path('safety/', include('apps.safety.urls', namespace='safety')),
    path('ai/', include('apps.ai_assistant.urls', namespace='ai_assistant')),
    path('gallery/', include('apps.gallery.urls', namespace='gallery')),
    path('chat/', include('apps.chat.urls', namespace='chat')),
    path('community/', include('apps.community.urls', namespace='community')),
    path('explore/', include('apps.explore.urls', namespace='explore')),

    # Root API (for safety-score endpoint)
    path('api/', include('api.urls')),
]


# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# Customize Django Admin UI
admin.site.site_header = "YatraSecure Admin"
admin.site.site_title = "YatraSecure Admin Portal"
admin.site.index_title = "Welcome to YatraSecure Administration"
