"""
Cultural Information Routes
Cultural tips, customs, and local information
"""

from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from extensions import db
from models.cultural import CulturalInfo, LocalCustom, LanguagePhrase, FestivalInfo

cultural_bp = Blueprint('cultural', __name__)


def get_dummy_cultural_data():
    """Dummy cultural data for demo"""
    return {
        'Rajasthan': {
            'customs': [
                {
                    'title': 'Traditional Greeting',
                    'description': 'Greet with "Khamma Ghani" - the traditional Rajasthani greeting.',
                    'tips': 'Fold your hands in Namaste gesture while greeting elders.',
                    'do': ['Remove shoes before entering temples', 'Dress modestly', 'Accept tea/chai when offered'],
                    'dont': ['Point feet towards deities', 'Refuse hospitality', 'Take photos without permission']
                },
                {
                    'title': 'Food Etiquette',
                    'description': 'Rajasthani cuisine is rich and traditionally eaten with hands.',
                    'tips': 'Use your right hand only while eating. Left hand is considered unclean.',
                    'do': ['Wash hands before meals', 'Try local dal-baati-churma', 'Accept food offerings'],
                    'dont': ['Waste food', 'Use left hand for eating', 'Refuse food offerings']
                }
            ],
            'phrases': [
                {'english': 'Hello/Greetings', 'local': 'Khamma Ghani', 'pronunciation': 'KHA-ma GHA-ni'},
                {'english': 'Thank you', 'local': 'Dhanyavaad', 'pronunciation': 'dhan-ya-VAAD'},
                {'english': 'How much?', 'local': 'Kitne ke?', 'pronunciation': 'KIT-ne ke'},
                {'english': 'Water please', 'local': 'Paani dijiye', 'pronunciation': 'PAA-ni di-JI-ye'}
            ],
            'festivals': [
                {
                    'name': 'Pushkar Camel Fair',
                    'month': 'November',
                    'description': 'World\'s largest camel fair with cultural programs',
                    'duration': '7 days'
                }
            ]
        },
        'Kerala': {
            'customs': [
                {
                    'title': 'Traditional Greeting',
                    'description': 'Greet with folded hands and say "Namaskaram".',
                    'tips': 'Kerala culture values respect and hospitality.',
                    'do': ['Remove footwear before entering homes', 'Accept banana leaf meals', 'Respect temple customs'],
                    'dont': ['Refuse food when offered', 'Wear revealing clothes in temples', 'Litter in backwaters']
                }
            ],
            'phrases': [
                {'english': 'Hello', 'local': 'Namaskaram', 'pronunciation': 'na-mas-KA-ram'},
                {'english': 'Thank you', 'local': 'Nanni', 'pronunciation': 'NAN-ni'},
                {'english': 'Delicious', 'local': 'Ruchi', 'pronunciation': 'RU-chi'},
                {'english': 'Beautiful', 'local': 'Sundaram', 'pronunciation': 'sun-da-RAM'}
            ],
            'festivals': [
                {
                    'name': 'Onam',
                    'month': 'August-September',
                    'description': 'Harvest festival with grand feast (Onam Sadya)',
                    'duration': '10 days'
                }
            ]
        },
        'Goa': {
            'customs': [
                {
                    'title': 'Beach Etiquette',
                    'description': 'Respect local customs even in beach destinations.',
                    'tips': 'While Goa is liberal, respect local sentiments.',
                    'do': ['Dress appropriately outside beach areas', 'Learn some Konkani words', 'Try local seafood'],
                    'dont': ['Public intoxication', 'Loud music late night', 'Litter on beaches']
                }
            ],
            'phrases': [
                {'english': 'Hello', 'local': 'Deu borem korum', 'pronunciation': 'deh-oo BO-rem KO-rum'},
                {'english': 'Thank you', 'local': 'Dev borem korum', 'pronunciation': 'dev BO-rem KO-rum'},
                {'english': 'How much?', 'local': 'Kitlo zata?', 'pronunciation': 'KIT-lo ZA-ta'},
                {'english': 'Delicious', 'local': 'Ghodd', 'pronunciation': 'GO-dd'}
            ],
            'festivals': [
                {
                    'name': 'Carnival',
                    'month': 'February-March',
                    'description': 'Colorful celebration with parades and music',
                    'duration': '3 days'
                }
            ]
        }
    }


@cultural_bp.route('/')
@login_required
def cultural_home():
    """Cultural information home"""
    states = ['Rajasthan', 'Kerala', 'Goa', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'West Bengal']
    return render_template('cultural/home.html', states=states)


@cultural_bp.route('/state/<state>')
@login_required
def state_culture(state):
    """Cultural information for specific state"""
    try:
        # Get from database
        customs = CulturalInfo.query.filter_by(state=state).all()
        local_customs = LocalCustom.query.filter_by(state=state).all()
        phrases = LanguagePhrase.query.filter_by(state=state).all()
        festivals = FestivalInfo.query.filter_by(state=state).all()
        
        # If no database data, use dummy data
        dummy_data = get_dummy_cultural_data()
        if not customs and state in dummy_data:
            data = dummy_data[state]
        else:
            data = {
                'customs': customs,
                'phrases': phrases,
                'festivals': festivals
            }
        
        return render_template('cultural/state_detail.html',
                             state=state,
                             data=data if state in dummy_data else None,
                             customs=customs,
                             local_customs=local_customs,
                             phrases=phrases,
                             festivals=festivals)
    except Exception as e:
        print(f"State culture error: {e}")
        return render_template('cultural/state_detail.html',
                             state=state,
                             data=None,
                             customs=[],
                             local_customs=[],
                             phrases=[],
                             festivals=[])


@cultural_bp.route('/phrases')
@login_required
def phrase_guide():
    """Common phrases guide"""
    try:
        states = ['Rajasthan', 'Kerala', 'Goa', 'Tamil Nadu']
        dummy_data = get_dummy_cultural_data()
        
        return render_template('cultural/phrases.html',
                             states=states,
                             data=dummy_data)
    except Exception as e:
        print(f"Phrase guide error: {e}")
        return render_template('cultural/phrases.html',
                             states=[],
                             data={})


@cultural_bp.route('/festivals')
@login_required
def festivals():
    """Festival calendar"""
    try:
        # Get from database
        all_festivals = FestivalInfo.query.order_by(FestivalInfo.typical_dates).all()
        
        # If no database data, use dummy data
        if not all_festivals:
            dummy_data = get_dummy_cultural_data()
            festivals_list = []
            for state, info in dummy_data.items():
                for fest in info.get('festivals', []):
                    fest['state'] = state
                    festivals_list.append(fest)
            
            return render_template('cultural/festivals.html',
                                 festivals=festivals_list,
                                 use_dummy=True)
        
        return render_template('cultural/festivals.html',
                             festivals=all_festivals,
                             use_dummy=False)
    except Exception as e:
        print(f"Festivals error: {e}")
        return render_template('cultural/festivals.html',
                             festivals=[],
                             use_dummy=False)
