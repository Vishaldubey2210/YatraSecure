// ─────────────────────────────────────────────────────────
// BookingData.ts – Dynamic deal generator for CrewAI Booking
// ─────────────────────────────────────────────────────────

export const SOURCES = {
  flights: [
    { name: "MakeMyTrip", url: "https://www.makemytrip.com/flights/?ref=yatrasecure" },
    { name: "Cleartrip", url: "https://www.cleartrip.com/flights?ref=yatrasecure" },
    { name: "Yatra", url: "https://www.yatra.com/flights?ref=yatrasecure" },
    { name: "Goibibo", url: "https://www.goibibo.com/flights/?ref=yatrasecure" },
    { name: "IXIGO", url: "https://www.ixigo.com/flights?ref=yatrasecure" },
  ],
  hotels: [
    { name: "Booking.com", url: "https://www.booking.com/?ref=yatrasecure" },
    { name: "Agoda", url: "https://www.agoda.com/?ref=yatrasecure" },
    { name: "MakeMyTrip", url: "https://www.makemytrip.com/hotels/?ref=yatrasecure" },
    { name: "OYO", url: "https://www.oyorooms.com/?ref=yatrasecure" },
    { name: "Goibibo", url: "https://www.goibibo.com/hotels/?ref=yatrasecure" },
  ],
  activities: [
    { name: "Thrillophilia", url: "https://www.thrillophilia.com/?ref=yatrasecure" },
    { name: "GetYourGuide", url: "https://www.getyourguide.com/?ref=yatrasecure" },
    { name: "Viator", url: "https://www.viator.com/?ref=yatrasecure" },
    { name: "Klook", url: "https://www.klook.com/?ref=yatrasecure" },
  ],
};

const AIRLINES = ["IndiGo", "Vistara", "Air India", "SpiceJet", "Akasa Air"];
const AIRLINE_CODES: Record<string, string> = {
  IndiGo: "6E", Vistara: "UK", "Air India": "AI", SpiceJet: "SG", "Akasa Air": "QP"
};

const DEST_PRICES: Record<string, { flightBase: number; hotelBase: number; actBase: number }> = {
  Goa:       { flightBase: 5500,  hotelBase: 4500,  actBase: 1500 },
  Manali:    { flightBase: 6200,  hotelBase: 3500,  actBase: 1200 },
  Jaipur:    { flightBase: 4800,  hotelBase: 3800,  actBase: 900  },
  Rishikesh: { flightBase: 5200,  hotelBase: 2800,  actBase: 1000 },
  Kerala:    { flightBase: 6800,  hotelBase: 5500,  actBase: 1800 },
  Bali:      { flightBase: 22000, hotelBase: 8000,  actBase: 2500 },
  Dubai:     { flightBase: 28000, hotelBase: 12000, actBase: 4000 },
  Paris:     { flightBase: 55000, hotelBase: 18000, actBase: 5000 },
  default:   { flightBase: 6000,  hotelBase: 4000,  actBase: 1500 },
};

const HOTEL_NAMES: Record<string, string[]> = {
  Goa:       ["Taj Fort Aguada Resort", "The Leela Goa", "Caravela Beach Resort", "Novotel Goa Dona Sylvia", "Grand Hyatt Goa", "W Goa"],
  Manali:    ["Span Resort & Spa", "Solang Valley Resort", "Apple Country Resort", "Manuallaya Spa Resort", "The Himalayan Manali", "Snowflakes Manali"],
  Jaipur:    ["Rambagh Palace", "The Oberoi Rajvilas", "Samode Palace Hotel", "ITC Rajputana", "Fairmont Jaipur", "Trident Jaipur"],
  Rishikesh: ["Aloha on the Ganges", "Atali Ganga", "Ananda in the Himalayas", "Divine Resort", "Ganga Kinare Boutique", "Veda5 Retreat"],
  Kerala:    ["Kumarakom Lake Resort", "Spice Village Periyar", "Marari Beach Resort", "Coconut Lagoon CGH", "Casino Hotel Kochi", "Taj Malabar Resort"],
  default:   ["Grand Heritage Hotel", "Royal Comfort Inn", "City Palace Suites", "Mountain View Resort", "Budget Traveller's Inn", "Boutique Stay"],
};

const ACTIVITIES: Record<string, { name: string; type: string; duration: string; price: number }[]> = {
  Goa: [
    { name: "Water Sports Package (Parasailing + Jet Ski)", type: "Adventure", duration: "3 hrs", price: 2500 },
    { name: "Sunset Cruise on Mandovi River", type: "Relaxation", duration: "2 hrs", price: 1500 },
    { name: "Dudhsagar Waterfall Jeep Trek", type: "Adventure", duration: "Full Day", price: 1800 },
    { name: "Goa Heritage & Spice Plantation Tour", type: "Cultural", duration: "5 hrs", price: 1200 },
    { name: "Scuba Diving at Grande Island", type: "Adventure", duration: "4 hrs", price: 3500 },
    { name: "Goa Food & Night Market Walk", type: "Food", duration: "3 hrs", price: 800 },
  ],
  Manali: [
    { name: "Solang Valley Snow Sports Package", type: "Adventure", duration: "Full Day", price: 2200 },
    { name: "Rohtang Pass Jeep Excursion", type: "Adventure", duration: "Full Day", price: 1800 },
    { name: "Beas River Rafting (Grade 3-4)", type: "Adventure", duration: "3 hrs", price: 900 },
    { name: "Himalayan Village Walk & Cafe Hop", type: "Cultural", duration: "4 hrs", price: 600 },
    { name: "Paragliding in Solang Valley", type: "Adventure", duration: "2 hrs", price: 2500 },
    { name: "Ayurvedic Spa & Mountain Yoga", type: "Relaxation", duration: "2 hrs", price: 1500 },
  ],
  Jaipur: [
    { name: "Amber Fort Heritage Tour with Elephant Ride", type: "Cultural", duration: "4 hrs", price: 1200 },
    { name: "Jaipur Night Food Safari", type: "Food", duration: "3 hrs", price: 900 },
    { name: "Hot Air Balloon Ride over Pink City", type: "Adventure", duration: "1.5 hrs", price: 7500 },
    { name: "Block Printing & Pottery Workshop", type: "Cultural", duration: "3 hrs", price: 700 },
    { name: "Rajasthan Cultural Evening at Chokhi Dhani", type: "Cultural", duration: "4 hrs", price: 1200 },
    { name: "Yoga & Meditation at Heritage Haveli", type: "Relaxation", duration: "2 hrs", price: 800 },
  ],
  default: [
    { name: "City Heritage Walking Tour", type: "Cultural", duration: "3 hrs", price: 800 },
    { name: "Local Food Experience & Street Tour", type: "Food", duration: "2 hrs", price: 600 },
    { name: "Adventure Nature Trek", type: "Adventure", duration: "4 hrs", price: 1200 },
    { name: "Spa & Wellness Day Package", type: "Relaxation", duration: "3 hrs", price: 2000 },
  ],
};

function r(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rc<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }

function getSeasonMultiplier(startDate?: string): number {
  if (!startDate) return 1.0;
  const month = new Date(startDate).getMonth() + 1;
  if (month === 12 || month === 1) return 1.3;  // Peak
  if (month >= 6 && month <= 9) return 0.8;     // Off-peak
  return 1.0;
}

export function generateDeals(destination: string, startDate?: string, budget?: number) {
  const key = Object.keys(DEST_PRICES).find(k => destination.toLowerCase().includes(k.toLowerCase())) || "default";
  const prices = DEST_PRICES[key] || DEST_PRICES.default;
  const sm = getSeasonMultiplier(startDate);
  const hotelNames = HOTEL_NAMES[key] || HOTEL_NAMES.default;
  const acts = ACTIVITIES[key] || ACTIVITIES.default;

  // FLIGHTS
  const flights = AIRLINES.map((airline, i) => {
    const stops = i < 3 ? 0 : r(0, 1);
    const depHr = r(5, 22);
    const dur = stops === 0 ? r(90, 180) : r(200, 360);
    const arrHr = (depHr + Math.floor(dur / 60)) % 24;
    const src = rc(SOURCES.flights);
    const price = Math.round(prices.flightBase * sm * rFloat(0.85, 1.25));
    return {
      id: `f-${i}`,
      type: "flight",
      airline,
      code: `${AIRLINE_CODES[airline]}-${r(100, 999)}`,
      title: `${airline} – ${stops === 0 ? "Direct" : "1 Stop"}`,
      departure: `${depHr.toString().padStart(2, "0")}:${r(0,5)*10 || "00"}`,
      arrival: `${arrHr.toString().padStart(2, "0")}:${r(0,5)*10 || "00"}`,
      duration: `${Math.floor(dur / 60)}h ${dur % 60}m`,
      stops,
      price,
      rating: rFloat(3.5, 5.0),
      source: src.name,
      sourceUrl: src.url,
      features: ["15kg Baggage", stops === 0 ? "Non-stop" : "1 Layover", "Web Check-in"],
    };
  });

  // HOTELS
  const hotels = hotelNames.map((name, i) => {
    const stars = i < 2 ? 5 : i < 4 ? 4 : 3;
    const src = rc(SOURCES.hotels);
    const price = Math.round(prices.hotelBase * sm * rFloat(0.7, 1.5) * (stars === 5 ? 1.8 : stars === 4 ? 1.2 : 0.8));
    return {
      id: `h-${i}`,
      type: "hotel",
      title: name,
      stars,
      price,
      rating: rFloat(stars === 5 ? 4.2 : 3.5, 5.0),
      location: `${destination} ${rc(["City Centre", "Beach Road", "Highway", "Old Town", "Resort Zone"])}`,
      amenities: [stars >= 4 ? "Pool" : "Common Area", "Free WiFi", stars === 5 ? "Spa & Gym" : "Breakfast", "24/7 Reception"],
      source: src.name,
      sourceUrl: src.url,
    };
  });

  // ACTIVITIES
  const activities = acts.map((act, i) => {
    const src = rc(SOURCES.activities);
    const price = Math.round(act.price * sm * rFloat(0.9, 1.2));
    return {
      id: `a-${i}`,
      type: "activity",
      title: act.name,
      actType: act.type,
      duration: act.duration,
      price,
      rating: rFloat(4.0, 5.0),
      reviews: r(50, 800),
      source: src.name,
      sourceUrl: src.url,
      features: ["Pickup Included", "Guide Provided"],
    };
  });

  return { flights, hotels, activities };
}

export function buildBundles(flights: any[], hotels: any[], activities: any[]) {
  if (!flights.length || !hotels.length || !activities.length) return [];

  const sorted = (arr: any[]) => [...arr].sort((a, b) => a.price - b.price);
  const byRating = (arr: any[]) => [...arr].sort((a, b) => b.rating - a.rating);

  const cheapF = sorted(flights)[0], cheapH = sorted(hotels)[0], cheapA = sorted(activities)[0];
  const midF = flights[Math.floor(flights.length / 2)], midH = hotels[Math.floor(hotels.length / 2)], midA = activities[Math.floor(activities.length / 2)];
  const luxF = byRating(flights)[0], luxH = byRating(hotels)[0], luxA = byRating(activities)[0];

  return [
    { id: "b1", label: "Budget Saver", icon: "💰", f: cheapF, h: cheapH, a: cheapA, discount: 12 },
    { id: "b2", label: "Best Value",   icon: "⭐", f: midF,   h: midH,   a: midA,   discount: 10 },
    { id: "b3", label: "Luxury Pick",  icon: "👑", f: luxF,   h: luxH,   a: luxA,   discount: 7  },
  ].map(b => {
    const orig = (b.f?.price || 0) + (b.h?.price || 0) + (b.a?.price || 0);
    const saved = Math.round(orig * (b.discount / 100));
    return { ...b, originalPrice: orig, savedAmount: saved, finalPrice: orig - saved };
  });
}
