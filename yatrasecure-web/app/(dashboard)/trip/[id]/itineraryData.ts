// Destination-aware activity database for AI Itinerary Generator
export type Activity = { text: string; cost: number; type: "transport"|"food"|"attraction"|"experience" };
export type DayPool = { morning: Activity[]; afternoon: Activity[]; evening: Activity[] };

const DB: Record<string, DayPool> = {
  Goa: {
    morning: [
      { text: "Water sports at Baga Beach (jet ski, parasailing)", cost: 2500, type: "experience" },
      { text: "Sunrise yoga at Arambol Beach", cost: 500, type: "experience" },
      { text: "Dudhsagar Waterfall trek & jeep safari", cost: 1800, type: "experience" },
      { text: "Old Goa churches heritage walk (Se Cathedral, Basilica)", cost: 200, type: "attraction" },
      { text: "Dolphin-watching boat cruise", cost: 800, type: "experience" },
      { text: "Scuba diving at Grande Island", cost: 3500, type: "experience" },
      { text: "Spice plantation tour with lunch", cost: 1200, type: "experience" },
    ],
    afternoon: [
      { text: "Lunch at a beach shack (fresh seafood thali)", cost: 600, type: "food" },
      { text: "Calangute & Candolim beach hopping", cost: 300, type: "attraction" },
      { text: "Anjuna flea market shopping", cost: 800, type: "experience" },
      { text: "Chapora Fort & Vagator viewpoint", cost: 100, type: "attraction" },
      { text: "Palolem beach kayaking", cost: 700, type: "experience" },
      { text: "Cashew & coconut factory visit", cost: 400, type: "attraction" },
      { text: "Local Goan fish curry rice lunch at village restaurant", cost: 350, type: "food" },
    ],
    evening: [
      { text: "Sunset cruise on Mandovi River with live music", cost: 1500, type: "experience" },
      { text: "Tito's Lane nightlife & beach party", cost: 2000, type: "experience" },
      { text: "Curlies beach restaurant dinner (Anjuna)", cost: 900, type: "food" },
      { text: "Saturday Night Market at Arpora", cost: 600, type: "experience" },
      { text: "Casino Pride cruise (Panaji)", cost: 2500, type: "experience" },
      { text: "Seafood barbecue dinner at Baga beach", cost: 1200, type: "food" },
    ],
  },
  Manali: {
    morning: [
      { text: "Rohtang Pass snow excursion & snowboarding", cost: 1500, type: "experience" },
      { text: "Hadimba Devi Temple visit & cedar forest walk", cost: 200, type: "attraction" },
      { text: "Jogini Waterfall trek (3hr)", cost: 300, type: "experience" },
      { text: "Solang Valley paragliding & zorbing", cost: 2200, type: "experience" },
      { text: "Beas River white water rafting", cost: 900, type: "experience" },
      { text: "Vashisht hot springs & village walk", cost: 150, type: "attraction" },
      { text: "Manu Temple & ancient village trek", cost: 200, type: "attraction" },
    ],
    afternoon: [
      { text: "Lunch at Old Manali cafe (trout fish, Maggi, momos)", cost: 400, type: "food" },
      { text: "Mall Road shopping (woolens, dry fruits, Himachali caps)", cost: 1000, type: "experience" },
      { text: "Naggar Castle & Roerich Art Gallery visit", cost: 350, type: "attraction" },
      { text: "Apple orchard walk & fruit picking", cost: 200, type: "experience" },
      { text: "Van Vihar Park riverside picnic", cost: 100, type: "attraction" },
      { text: "Kullu valley day trip & Bijli Mahadev trek", cost: 800, type: "experience" },
      { text: "Great Himalayan National Park wildlife walk", cost: 600, type: "attraction" },
    ],
    evening: [
      { text: "Bonfire & barbecue at campsite", cost: 800, type: "experience" },
      { text: "Live music at Old Manali cafe", cost: 400, type: "experience" },
      { text: "Stargazing session with telescope (mountain viewpoint)", cost: 300, type: "experience" },
      { text: "Dhabba dinner: Himachali dham thali", cost: 350, type: "food" },
      { text: "River-side bonfire & folk music performance", cost: 600, type: "experience" },
      { text: "Hot chocolate & board games at cozy cafe", cost: 250, type: "food" },
    ],
  },
  Jaipur: {
    morning: [
      { text: "Amber Fort elephant ride & palace tour", cost: 1200, type: "attraction" },
      { text: "City Palace & Mubarak Mahal museum tour", cost: 700, type: "attraction" },
      { text: "Nahargarh Fort sunrise trek & city view", cost: 400, type: "attraction" },
      { text: "Jantar Mantar UNESCO observatory tour", cost: 250, type: "attraction" },
      { text: "Hawa Mahal photography & architecture walk", cost: 200, type: "attraction" },
      { text: "Jaigarh Fort & Jaivana cannon visit", cost: 350, type: "attraction" },
      { text: "Galtaji Monkey Temple pilgrimage walk", cost: 100, type: "attraction" },
    ],
    afternoon: [
      { text: "Traditional Rajasthani thali lunch at Lassiwala", cost: 450, type: "food" },
      { text: "Johari Bazaar gemstone & jewelry shopping", cost: 2000, type: "experience" },
      { text: "Block printing & pottery workshop", cost: 600, type: "experience" },
      { text: "Albert Hall Museum Rajasthani art collection", cost: 150, type: "attraction" },
      { text: "Sisodia Rani Garden & palace visit", cost: 100, type: "attraction" },
      { text: "Bapu Bazaar textile & handicraft shopping", cost: 1500, type: "experience" },
      { text: "Birla Mandir temple visit & garden walk", cost: 50, type: "attraction" },
    ],
    evening: [
      { text: "Chokhi Dhani Rajasthani village cultural experience", cost: 1200, type: "experience" },
      { text: "Light & Sound show at Amber Fort", cost: 500, type: "experience" },
      { text: "Jal Mahal sunset photography", cost: 100, type: "attraction" },
      { text: "Rooftop dinner with fort view (1135 AD restaurant)", cost: 1800, type: "food" },
      { text: "Puppet show & folk dance performance", cost: 400, type: "experience" },
      { text: "Night bazaar walk & street food tour", cost: 600, type: "experience" },
    ],
  },
  Rishikesh: {
    morning: [
      { text: "White water rafting Grade 3-4 (16km stretch)", cost: 800, type: "experience" },
      { text: "Laxman Jhula to Ram Jhula yoga & ashram walk", cost: 200, type: "attraction" },
      { text: "Neer Garh Waterfall trek (2hr)", cost: 300, type: "experience" },
      { text: "Sunrise yoga class at Parmarth Niketan Ashram", cost: 400, type: "experience" },
      { text: "Bungee jumping at Jumpin Heights (83m)", cost: 3500, type: "experience" },
      { text: "Flying fox zipline & giant swing combo", cost: 2200, type: "experience" },
      { text: "Rajaji National Park safari (jeep)", cost: 1500, type: "experience" },
    ],
    afternoon: [
      { text: "Beatle Ashram (Chaurasi Kutia) exploration", cost: 150, type: "attraction" },
      { text: "Cafe hopping on the Beatles Cafe strip", cost: 500, type: "food" },
      { text: "Kayaking on the Ganges", cost: 700, type: "experience" },
      { text: "Kunjapuri Devi Temple hike with valley views", cost: 300, type: "attraction" },
      { text: "Lakshman Temple & local market walk", cost: 200, type: "attraction" },
      { text: "Camping & rappelling at Shivpuri", cost: 1800, type: "experience" },
      { text: "Ayurvedic cooking class", cost: 900, type: "experience" },
    ],
    evening: [
      { text: "Ganga Aarti at Triveni Ghat (spectacular)", cost: 0, type: "attraction" },
      { text: "Campfire & stargazing by the Ganges", cost: 500, type: "experience" },
      { text: "Yoga Nidra meditation session", cost: 300, type: "experience" },
      { text: "Dinner at Chotiwala Restaurant (iconic)", cost: 400, type: "food" },
      { text: "Riverside chai & music session", cost: 150, type: "food" },
      { text: "Night hike to Neer Garh with torch", cost: 200, type: "experience" },
    ],
  },
  Kerala: {
    morning: [
      { text: "Alleppey houseboat ride through backwaters", cost: 4500, type: "experience" },
      { text: "Periyar Tiger Reserve jungle safari", cost: 1200, type: "experience" },
      { text: "Munnar tea plantation tour & factory visit", cost: 600, type: "experience" },
      { text: "Kovalam beach sunrise & lighthouse climb", cost: 200, type: "attraction" },
      { text: "Athirapally & Vazhachal waterfalls trek", cost: 400, type: "attraction" },
      { text: "Kathakali cultural performance & makeup session", cost: 800, type: "experience" },
      { text: "Fort Kochi heritage walk & Chinese fishing nets", cost: 300, type: "attraction" },
    ],
    afternoon: [
      { text: "Kerala Sadya (banana leaf feast) at local restaurant", cost: 350, type: "food" },
      { text: "Spice market tour in Mattancherry", cost: 400, type: "experience" },
      { text: "Kumarakom Bird Sanctuary rowboat tour", cost: 700, type: "experience" },
      { text: "Ayurvedic massage & wellness treatment", cost: 2000, type: "experience" },
      { text: "Jew Town antique market exploration (Kochi)", cost: 500, type: "experience" },
      { text: "Parambikulam wildlife sanctuary visit", cost: 800, type: "attraction" },
      { text: "Coconut grove walk & toddy tasting", cost: 300, type: "experience" },
    ],
    evening: [
      { text: "Sunset cruise on Vembanad Lake", cost: 1200, type: "experience" },
      { text: "Kalaripayattu martial arts performance", cost: 700, type: "experience" },
      { text: "Seafood dinner at Malabar Junction restaurant", cost: 1500, type: "food" },
      { text: "Beach barbecue at Varkala Cliff", cost: 900, type: "food" },
      { text: "Theyyam ritual ceremony (cultural)", cost: 500, type: "experience" },
      { text: "Cooking class: learn Kerala fish curry", cost: 1000, type: "experience" },
    ],
  },
};

// Generic fallback for unlisted destinations
const GENERIC: DayPool = {
  morning: [
    { text: "City heritage walk & local museum visit", cost: 400, type: "attraction" },
    { text: "Local market exploration & street food breakfast", cost: 350, type: "food" },
    { text: "Nature hike / viewpoint visit", cost: 300, type: "experience" },
    { text: "Guided sightseeing tour of top landmarks", cost: 800, type: "attraction" },
  ],
  afternoon: [
    { text: "Traditional local cuisine lunch at popular dhaba", cost: 450, type: "food" },
    { text: "Shopping at main bazaar / souvenir market", cost: 1000, type: "experience" },
    { text: "Historical fort / temple / monument visit", cost: 250, type: "attraction" },
    { text: "Local cooking class or cultural workshop", cost: 800, type: "experience" },
  ],
  evening: [
    { text: "Sunset viewpoint visit & photography", cost: 100, type: "attraction" },
    { text: "Cultural performance / folk music show", cost: 500, type: "experience" },
    { text: "Street food tour & local chai session", cost: 400, type: "food" },
    { text: "Rooftop dinner at popular local restaurant", cost: 900, type: "food" },
  ],
};

// Adventure overlays
const ADVENTURE_OVERLAY: Partial<DayPool> = {
  morning: [
    { text: "Sunrise trekking to mountain viewpoint", cost: 600, type: "experience" },
    { text: "Rock climbing & rappelling session", cost: 1500, type: "experience" },
    { text: "River crossing & waterfall hike", cost: 800, type: "experience" },
  ],
};

// Relaxing overlays
const RELAXING_OVERLAY: Partial<DayPool> = {
  afternoon: [
    { text: "Spa & ayurvedic massage session", cost: 1800, type: "experience" },
    { text: "Leisurely lakeside / beachside walk with ice cream", cost: 300, type: "experience" },
    { text: "Poolside relaxation & reading", cost: 0, type: "experience" },
  ],
  evening: [
    { text: "Sunset meditation & yoga session", cost: 400, type: "experience" },
    { text: "Quiet dinner at hotel restaurant", cost: 800, type: "food" },
  ],
};

// Luxury overlays
const LUXURY_OVERLAY: Partial<DayPool> = {
  morning: [
    { text: "Private helicopter sightseeing tour", cost: 8000, type: "experience" },
    { text: "Private guided sunrise tour with breakfast", cost: 3500, type: "experience" },
  ],
  evening: [
    { text: "Fine dining at award-winning restaurant", cost: 4000, type: "food" },
    { text: "Private sunset cruise with champagne", cost: 5000, type: "experience" },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function scaleCost(base: number, budgetPerPerson: number): number {
  // Scale activity cost relative to daily budget (budget/duration ~ daily budget)
  // If budget is high, scale up slightly; if low, scale down
  const scalar = budgetPerPerson > 20000 ? 1.5 : budgetPerPerson > 10000 ? 1.0 : 0.65;
  return Math.round(base * scalar);
}

export function generateSmartItinerary(
  destination: string,
  daysCount: number,
  budgetPerPerson: number,
  prompt: string
): any[] {
  const p = prompt.toLowerCase();
  const isAdventure = p.includes("adventure") || p.includes("thrill") || p.includes("trek");
  const isRelaxing = p.includes("relax") || p.includes("spa") || p.includes("leisure") || p.includes("calm");
  const isLuxury = p.includes("luxury") || p.includes("premium") || p.includes("5 star");
  const isBudget = p.includes("budget") || p.includes("cheap") || p.includes("economical");

  // Find destination pool (case-insensitive partial match)
  const destKey = Object.keys(DB).find(k => destination.toLowerCase().includes(k.toLowerCase())) || "";
  const pool: DayPool = destKey ? DB[destKey] : GENERIC;

  // Apply overlays
  let mornings = [...pool.morning];
  let afternoons = [...pool.afternoon];
  let evenings = [...pool.evening];

  if (isAdventure && ADVENTURE_OVERLAY.morning) mornings = [...ADVENTURE_OVERLAY.morning, ...mornings];
  if (isRelaxing && RELAXING_OVERLAY.afternoon) afternoons = [...RELAXING_OVERLAY.afternoon, ...afternoons];
  if (isRelaxing && RELAXING_OVERLAY.evening) evenings = [...RELAXING_OVERLAY.evening, ...evenings];
  if (isLuxury && LUXURY_OVERLAY.morning) mornings = [...LUXURY_OVERLAY.morning, ...mornings];
  if (isLuxury && LUXURY_OVERLAY.evening) evenings = [...LUXURY_OVERLAY.evening, ...evenings];

  // Shuffle all pools
  mornings = shuffle(mornings);
  afternoons = shuffle(afternoons);
  evenings = shuffle(evenings);

  const budgetScalar = isBudget ? 0.6 : isLuxury ? 2.0 : 1.0;

  const days = [];
  for (let i = 0; i < daysCount; i++) {
    const mAct = mornings[i % mornings.length];
    const aAct = afternoons[i % afternoons.length];
    const eAct = evenings[i % evenings.length];

    // First day: add arrival logistics
    const dayActivities = i === 0
      ? [
          { id: `d${i+1}-a0`, timeOfDay: "Morning", text: `Travel to ${destination} & check-in at hotel`, cost: Math.round(1200 * budgetScalar), type: "transport" },
          { id: `d${i+1}-a1`, timeOfDay: "Afternoon", text: aAct.text, cost: Math.round(scaleCost(aAct.cost, budgetPerPerson) * budgetScalar) },
          { id: `d${i+1}-a2`, timeOfDay: "Evening", text: eAct.text, cost: Math.round(scaleCost(eAct.cost, budgetPerPerson) * budgetScalar) },
        ]
      : i === daysCount - 1
      ? [
          { id: `d${i+1}-a0`, timeOfDay: "Morning", text: mAct.text, cost: Math.round(scaleCost(mAct.cost, budgetPerPerson) * budgetScalar) },
          { id: `d${i+1}-a1`, timeOfDay: "Afternoon", text: "Last-minute shopping & packing", cost: Math.round(500 * budgetScalar), type: "experience" },
          { id: `d${i+1}-a2`, timeOfDay: "Evening", text: `Check-out & travel back home`, cost: Math.round(1200 * budgetScalar), type: "transport" },
        ]
      : [
          { id: `d${i+1}-a0`, timeOfDay: "Morning", text: mAct.text, cost: Math.round(scaleCost(mAct.cost, budgetPerPerson) * budgetScalar) },
          { id: `d${i+1}-a1`, timeOfDay: "Afternoon", text: aAct.text, cost: Math.round(scaleCost(aAct.cost, budgetPerPerson) * budgetScalar) },
          { id: `d${i+1}-a2`, timeOfDay: "Evening", text: eAct.text, cost: Math.round(scaleCost(eAct.cost, budgetPerPerson) * budgetScalar) },
        ];

    days.push({ id: `day-${i+1}`, day: i + 1, activities: dayActivities });
  }
  return days;
}
