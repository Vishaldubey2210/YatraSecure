YatraSecure/
│
├── app.py                          # Main Flask application
├── config.py                       # Configuration settings
├── requirements.txt                # Python dependencies
├── .env                            # Environment variables (API keys)
│
├── database/
│   ├── init_db.py                 # Database initialization script
│   ├── yatraSecure.db             # SQLite database file
│   └── dummy_data.py              # Populate dummy data
│
├── models/
│   ├── user.py                    # User model
│   ├── trip.py                    # Trip model
│   ├── provider.py                # Service provider model
│   ├── safety.py                  # Safety zones & scores
│   └── booking.py                 # Booking model
│
├── routes/
│   ├── auth.py                    # Authentication routes
│   ├── dashboard.py               # User dashboard routes
│   ├── trip.py                    # Trip management routes
│   ├── booking.py                 # Booking routes
│   ├── safety.py                  # Safety features routes
│   ├── provider.py                # Service provider routes
│   ├── admin.py                   # Admin dashboard routes
│   └── api.py                     # API endpoints
│
├── services/
│   ├── gemini_chatbot.py          # Gemini AI integration
│   ├── twitter_scraper.py         # Twitter NLP scraping
│   ├── safety_calculator.py       # Safety score calculations
│   ├── map_service.py             # OpenStreetMap integration
│   └── payment_service.py         # Web3 wallet simulation
│
├── utils/
│   ├── helpers.py                 # Helper functions
│   ├── validators.py              # Input validation
│   └── security.py                # Password hashing, JWT
│
├── static/
│   ├── css/
│   │   ├── main.css              # Main stylesheet
│   │   ├── dashboard.css         # Dashboard specific styles
│   │   └── themes.css            # Color themes
│   │
│   ├── js/
│   │   ├── main.js               # Main JavaScript
│   │   ├── map.js                # Map functionality
│   │   ├── chatbot.js            # Chatbot interface
│   │   ├── web3wallet.js         # Web3 wallet UI
│   │   └── trip-planner.js       # Trip planning features
│   │
│   └── images/
│       ├── logo.png              # YatraSecure logo
│       ├── icons/                # Feature icons
│       └── backgrounds/          # Background images
│
└── templates/
    ├── base.html                 # Base template
    ├── index.html                # Landing page
    │
    ├── auth/
    │   ├── login.html            # Login page
    │   ├── signup.html           # Signup page
    │   └── forgot_password.html  # Password recovery
    │
    ├── dashboard/
    │   ├── user_dashboard.html   # Tourist dashboard
    │   ├── trip_details.html     # Trip management
    │   ├── profile.html          # User profile
    │   └── premium.html          # Premium upgrade page
    │
    ├── trip/
    │   ├── create_trip.html      # Create new trip
    │   ├── join_trip.html        # Join with code
    │   ├── itinerary.html        # Itinerary planner
    │   └── expenses.html         # Web3 pool wallet
    │
    ├── safety/
    │   ├── safety_map.html       # Interactive safety map
    │   ├── alerts.html           # Real-time alerts
    │   ├── community_reports.html # User reports
    │   └── scam_database.html    # Scam alerts
    │
    ├── booking/
    │   ├── browse.html           # Browse services
    │   ├── booking_form.html     # Booking interface
    │   └── my_bookings.html      # User bookings
    │
    ├── provider/
    │   ├── provider_signup.html  # Provider registration
    │   ├── provider_dashboard.html # Provider dashboard
    │   └── manage_services.html  # Service management
    │
    ├── admin/
    │   ├── admin_dashboard.html  # Admin panel
    │   ├── user_management.html  # Manage users
    │   ├── provider_approvals.html # Approve providers
    │   └── analytics.html        # Platform analytics
    │
    └── components/
        ├── navbar.html           # Navigation bar
        ├── footer.html           # Footer
        ├── chatbot_widget.html   # Chatbot popup
        └── alert_banner.html     # Alert notifications
# YatraSecure - Smart Travel Safety Platform

## Overview
YatraSecure is an all-India travel safety platform providing real-time safety scores, community reports, AI-powered trip planning, and comprehensive emergency response features.

## Features
- 🛡️ Real-time Safety Scoring & Danger Zone Mapping
- 🚨 SOS Emergency Button with GPS Tracking
- 🤖 AI Travel Companion (Gemini API)
- 💰 Web3 Pool Wallet for Group Expenses
- 🗺️ Interactive Safety Heatmaps
- 📱 Multi-language Support (10 languages)
- 🏨 Hotel, Guide & Transport Booking
- 🎯 Premium Features with Trip-based Pricing

## Tech Stack
- **Backend:** Python, Flask, SQLite
- **Frontend:** HTML, CSS (Bootstrap 5), JavaScript
- **AI:** Google Gemini API
- **Maps:** OpenStreetMap + Leaflet.js
- **NLP:** Twitter scraping for real-time alerts

## Installation

### Prerequisites
- Python 3.8+
- pip
- Git

### Setup Steps

1. Clone the repository
