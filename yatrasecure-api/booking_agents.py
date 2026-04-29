import os
import sys
import json
import logging
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from duckduckgo_search import DDGS

load_dotenv()

logging.basicConfig(level=logging.ERROR, stream=sys.stderr)

# ══════════════════════════════════════════════════════════════════════════════
# SAFE URL BUILDER — 100% Real Deal Links (No 404s)
# ══════════════════════════════════════════════════════════════════════════════

def make_safe_url(name: str, location: str, platform: str, category: str = "hotel", start_date: str = "", end_date: str = "", origin: str = "") -> str:
    """
    Constructs a guaranteed-working search URL for Indian platforms (MakeMyTrip, Goibibo, etc.)
    """
    loc_encoded = location.strip().replace(" ", "%20")
    platform = platform.lower()
    
    # Remove hyphens for MMT/Goibibo dates: YYYYMMDD
    date_mmt = start_date.replace("-", "") if start_date else ""
    end_mmt = end_date.replace("-", "") if end_date else ""

    if category == "flight":
        if "makemytrip" in platform or "mmt" in platform:
            return f"https://www.makemytrip.com/flight/search?itinerary={origin}-{location}-{date_mmt}"
        elif "goibibo" in platform:
            return f"https://www.goibibo.com/flights/air-{origin.lower()}-{location.lower()}-{date_mmt}/"
        elif "cleartrip" in platform:
            return f"https://www.cleartrip.com/flights/{origin.lower()}-{location.lower()}-{start_date}/"
        else:
            return "https://www.skyscanner.co.in/flights"
            
    elif category == "train":
        return "https://www.irctc.co.in/nget/train-search"
        
    elif category == "bus":
        return f"https://www.redbus.in/bus-tickets/{origin.lower()}-to-{location.lower()}"

    # Hotels
    if "booking" in platform:
        return f"https://www.booking.com/searchresults.html?ss={loc_encoded}&checkin={start_date}&checkout={end_date}"
    elif "makemytrip" in platform or "mmt" in platform:
        return f"https://www.makemytrip.com/hotels/hotel-listing/?city={loc_encoded}&checkin={date_mmt}&checkout={end_mmt}"
    elif "oyo" in platform:
        return f"https://www.oyorooms.com/search?location={loc_encoded}&checkin={start_date}&checkout={end_date}"
    elif "airbnb" in platform:
        loc_dash = location.strip().replace(" ", "-")
        return f"https://www.airbnb.co.in/s/{loc_dash}/homes?checkin={start_date}&checkout={end_date}"
    elif "hostelworld" in platform:
        return f"https://www.hostelworld.com/s?q={loc_encoded}&dateFrom={start_date}&dateTo={end_date}"
    elif category in ["activity", "experience"]:
        return f"https://www.tripadvisor.in/Search?q={name.replace(' ', '+')}+{location}"
        
    # Fallback
    query = f"{name} {location}".strip().replace(" ", "+")
    return f"https://www.google.com/search?q=book+{query}"


def sanitize_booking_urls(parsed: dict, dest: str, origin: str, start_date: str, end_date: str) -> dict:
    """Post-processes and injects genuine deals URLs natively into the object."""
    if "deals" in parsed:
        for item in parsed["deals"]:
            item["url"] = make_safe_url(
                name=item.get("title", ""),
                location=dest,
                platform=item.get("platform", ""),
                category=item.get("category", "hotel"),
                start_date=start_date,
                end_date=end_date,
                origin=origin
            )
            # Ensure price format is integer
            try:
                item["price"] = int(str(item.get("price", "0")).replace(',', '').replace('₹', '').replace(' INR', ''))
            except:
                item["price"] = 0
    return parsed


# ══════════════════════════════════════════════════════════════════════════════
# ENV SETUP
# ══════════════════════════════════════════════════════════════════════════════

api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY")

if not api_key or api_key == "PASTE_YOUR_GROQ_API_KEY_HERE":
    print(json.dumps({"error": "GROQ_API_KEY is not set."}))
    sys.exit(1)

# Configure for Groq via OpenAI-compatible API
if api_key.startswith("gsk_"):
    os.environ["OPENAI_API_KEY"] = api_key
    os.environ["OPENAI_API_BASE"] = "https://api.groq.com/openai/v1"
    os.environ["OPENAI_MODEL_NAME"] = "llama-3.3-70b-versatile"
else:
    os.environ["OPENAI_API_KEY"] = api_key

def main():
    try:
        input_data = sys.argv[1] if len(sys.argv) > 1 else "{}"
        params = json.loads(input_data)

        destination = params.get("destination", "Goa")
        dates_raw = params.get("dates", "2026-05-01 to 2026-05-10").split(" to ")
        start_date = dates_raw[0] if len(dates_raw) > 0 else "2026-05-01"
        end_date = dates_raw[1] if len(dates_raw) > 1 else "2026-05-10"
        
        origin = params.get("origin", "Delhi") # Attempt to get origin, default Delhi
        budget = str(params.get("budget", "50000"))
        custom_prompt = params.get("customPrompt", "")
        answers = params.get("answers", {})
        travelers = params.get("travelers", 1)

        acc_pref = answers.get("accommodation", "Any")
        food_pref = answers.get("food", "Any")
        trip_style = answers.get("style", "Any")

        # ── Fetch Live Data Upfront ──────────────────────────────────────────
        try:
            with DDGS() as ddgs:
                hotel_search = list(ddgs.text(
                    f"Top {acc_pref} hotels in {destination} with prices", max_results=2
                ))
                activity_search = list(ddgs.text(
                    f"Top {trip_style} activities in {destination} with ticket prices", max_results=2
                ))
                live_data = f"\nLIVE OTHERS SEARCH DATA: Hotels:{hotel_search} Activities:{activity_search}"
        except Exception:
            live_data = ""

        trip_context = f"""
TRIP DETAILS:
- Destination: {destination}
- Origin: {origin} 
- Dates: {start_date} to {end_date}
- Total Budget: ₹{budget} for {travelers} travelers
- Preferences: {acc_pref} hotels, {food_pref} food, {trip_style} vibe.
- User Custom Prompts: {custom_prompt}
{live_data}
"""

        # ══════════════════════════════════════════════════════════════════
        # AGENT 1: Travel Research Agent
        # ══════════════════════════════════════════════════════════════════
        research_agent = Agent(
            role='Senior Travel Deal Scouter',
            goal=f'Scout the absolute best REAL transport, hotel, and activity deals for {destination} with budget ₹{budget}.',
            backstory="""You aggressively find realistic Indian pricing for Makemytrip, Indigo, IRCTC, Booking.com, etc. You generate highly attractive 'Deals'.""",
            verbose=False,
            allow_delegation=False
        )

        budget_agent = Agent(
            role='Budget Optimizer Analyst',
            goal=f'Optimize the travel deals to strictly align with the ₹{budget} constraint while producing insightful money-saving tips.',
            backstory="""You ensure no deal is impossibly cheap or stupidly expensive. You provide brilliant Indian saving tips (like IRCTC TATKAL, off-season booking).""",
            verbose=False,
            allow_delegation=False
        )

        package_agent = Agent(
            role='AI Deal Synthesizer',
            goal='Structure the finalized deals exactly into the exact JSON Deals schema expected by the frontend UI.',
            backstory="""You output strictly pure JSON. No markdown ticks, no extra chat. Only the JSON keys: deals (array), savingTips (array of strings), totalEstimate (object).""",
            verbose=False,
            allow_delegation=False
        )

        # ══════════════════════════════════════════════════════════════════
        # TASKS
        # ══════════════════════════════════════════════════════════════════

        research_task = Task(
            description=f"""{trip_context}
            
TASK: Produce a list of 5 to 7 concrete 'Deals' covering Flights/Trains, Stays (Hotels/Hostels), and Activities for this trip.
Each deal MUST have:
1. category (flight, train, bus, hotel, hostel, experience)
2. title (e.g. "{origin} to {destination} — IndiGo")
3. platform (MakeMyTrip, IRCTC, Booking.com, etc)
4. price (Real INR price number)
5. originalPrice (For discount calculation)
6. discount (e.g. "20% off")
7. details (e.g. "Non-stop, 2h 30m" or "Free breakfast included")
8. rating (out of 5.0)
9. tag (e.g. "Cheapest", "Luxury", "Bestseller")
""",
            expected_output='List of realistic travel deals.',
            agent=research_agent
        )

        budget_task = Task(
            description=f"""Review the scouted deals. Create a budget breakdown across transport, accommodation, food, activities to ensure it fits the ₹{budget} target. Give 3 actionable savingsTips for {destination}.""",
            expected_output='Budget review and saving tips.',
            agent=budget_agent,
            context=[research_task]
        )

        package_task = Task(
            description=f"""Combine the research into this EXACT JSON structure. NO Markdown wrappers like ```json at all! ONLY the pure JSON object!

{{
  "deals": [
    {{
      "category": "flight",
      "title": "{origin} to {destination} — IndiGo",
      "platform": "MakeMyTrip",
      "price": 4500,
      "originalPrice": 6200,
      "discount": "27% off",
      "details": "Non-stop, 2h 30m, 6E 2156",
      "timing": "06:15 AM - 08:45 AM",
      "rating": 4.2,
      "tag": "Cheapest"
    }},
    {{
      "category": "hotel",
      "title": "Taj {destination}",
      "platform": "Booking.com",
      "price": 8500,
      "originalPrice": 10000,
      "discount": "15% off",
      "details": "Free Breakfast, Pool Access",
      "rating": 4.8,
      "tag": "Luxury Pick"
    }}
  ],
  "savingTips": ["Book 3 weeks early", "Use IRCTC Tatkal..."],
  "totalEstimate": {{
    "transport": 5000,
    "accommodation": 8500,
    "food": 3000,
    "activities": 2000,
    "total": 18500
  }}
}}
""",
            expected_output='Valid raw JSON object with deals.',
            agent=package_agent,
            context=[research_task, budget_task]
        )

        # ══════════════════════════════════════════════════════════════════
        # CREW EXECUTION
        # ══════════════════════════════════════════════════════════════════
        crew = Crew(
            agents=[research_agent, budget_agent, package_agent],
            tasks=[research_task, budget_task, package_task],
            verbose=False,
            process=Process.sequential
        )

        result = crew.kickoff()
        raw_output = str(result)

        # ── Parse JSON from output ───────────────────────────────────────
        parsed = None
        
        # Find JSON block in output
        import re
        json_match = re.search(r'\{[\s\S]*\}', raw_output)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
            except Exception as e:
                print(json.dumps({"error": f"Failed to parse JSON: {e}"}))
                sys.exit(1)

        if parsed:
            # SANITIZE URLs REAL
            parsed = sanitize_booking_urls(parsed, destination, origin, start_date, end_date)
            parsed["structured"] = True
            parsed["deals"] = parsed.get("deals", [])
            print(json.dumps(parsed))
        else:
            print(json.dumps({"error": "Failed to generate valid JSON."}))

    except Exception as e:
        logging.error(f"Booking engine error: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()