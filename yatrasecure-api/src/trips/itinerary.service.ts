import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ─── Indian Cities Database (for validation & intelligence) ─────────────────
const KNOWN_CITIES: Record<string, { lat: number; lng: number; type: 'metro' | 'tier2' | 'small'; state: string }> = {
  'delhi': { lat: 28.6139, lng: 77.2090, type: 'metro', state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, type: 'metro', state: 'Delhi' },
  'mumbai': { lat: 19.0760, lng: 72.8777, type: 'metro', state: 'Maharashtra' },
  'bangalore': { lat: 12.9716, lng: 77.5946, type: 'metro', state: 'Karnataka' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, type: 'metro', state: 'Karnataka' },
  'chennai': { lat: 13.0827, lng: 80.2707, type: 'metro', state: 'Tamil Nadu' },
  'kolkata': { lat: 22.5726, lng: 88.3639, type: 'metro', state: 'West Bengal' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, type: 'metro', state: 'Telangana' },
  'pune': { lat: 18.5204, lng: 73.8567, type: 'metro', state: 'Maharashtra' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, type: 'metro', state: 'Gujarat' },
  'jaipur': { lat: 26.9124, lng: 75.7873, type: 'tier2', state: 'Rajasthan' },
  'lucknow': { lat: 26.8467, lng: 80.9462, type: 'tier2', state: 'Uttar Pradesh' },
  'goa': { lat: 15.2993, lng: 74.1240, type: 'tier2', state: 'Goa' },
  'panaji': { lat: 15.4909, lng: 73.8278, type: 'tier2', state: 'Goa' },
  'udaipur': { lat: 24.5854, lng: 73.7125, type: 'tier2', state: 'Rajasthan' },
  'varanasi': { lat: 25.3176, lng: 82.9739, type: 'tier2', state: 'Uttar Pradesh' },
  'agra': { lat: 27.1767, lng: 78.0081, type: 'tier2', state: 'Uttar Pradesh' },
  'shimla': { lat: 31.1048, lng: 77.1734, type: 'small', state: 'Himachal Pradesh' },
  'manali': { lat: 32.2396, lng: 77.1887, type: 'small', state: 'Himachal Pradesh' },
  'rishikesh': { lat: 30.0869, lng: 78.2676, type: 'small', state: 'Uttarakhand' },
  'darjeeling': { lat: 27.0360, lng: 88.2627, type: 'small', state: 'West Bengal' },
  'leh': { lat: 34.1526, lng: 77.5771, type: 'small', state: 'Ladakh' },
  'ladakh': { lat: 34.1526, lng: 77.5771, type: 'small', state: 'Ladakh' },
  'munnar': { lat: 10.0889, lng: 77.0595, type: 'small', state: 'Kerala' },
  'alleppey': { lat: 9.4981, lng: 76.3388, type: 'small', state: 'Kerala' },
  'kochi': { lat: 9.9312, lng: 76.2673, type: 'tier2', state: 'Kerala' },
  'mysore': { lat: 12.2958, lng: 76.6394, type: 'tier2', state: 'Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, type: 'tier2', state: 'Karnataka' },
  'amritsar': { lat: 31.6340, lng: 74.8723, type: 'tier2', state: 'Punjab' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, type: 'tier2', state: 'Rajasthan' },
  'jaisalmer': { lat: 26.9157, lng: 70.9083, type: 'small', state: 'Rajasthan' },
  'ooty': { lat: 11.4102, lng: 76.6950, type: 'small', state: 'Tamil Nadu' },
  'coorg': { lat: 12.3375, lng: 75.8069, type: 'small', state: 'Karnataka' },
  'kodaikanal': { lat: 10.2381, lng: 77.4892, type: 'small', state: 'Tamil Nadu' },
  'gangtok': { lat: 27.3389, lng: 88.6065, type: 'small', state: 'Sikkim' },
  'mcleodganj': { lat: 32.2426, lng: 76.3213, type: 'small', state: 'Himachal Pradesh' },
  'dharamshala': { lat: 32.2190, lng: 76.3234, type: 'small', state: 'Himachal Pradesh' },
  'srinagar': { lat: 34.0837, lng: 74.7973, type: 'tier2', state: 'Jammu & Kashmir' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, type: 'tier2', state: 'Chandigarh' },
  'bhopal': { lat: 23.2599, lng: 77.4126, type: 'tier2', state: 'Madhya Pradesh' },
  'indore': { lat: 22.7196, lng: 75.8577, type: 'tier2', state: 'Madhya Pradesh' },
  'patna': { lat: 25.6093, lng: 85.1376, type: 'tier2', state: 'Bihar' },
  'ranchi': { lat: 23.3441, lng: 85.3096, type: 'tier2', state: 'Jharkhand' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, type: 'tier2', state: 'Odisha' },
  'guwahati': { lat: 26.1445, lng: 91.7362, type: 'tier2', state: 'Assam' },
  'vizag': { lat: 17.6868, lng: 83.2185, type: 'tier2', state: 'Andhra Pradesh' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, type: 'tier2', state: 'Andhra Pradesh' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, type: 'tier2', state: 'Kerala' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, type: 'tier2', state: 'Kerala' },
  'nagpur': { lat: 21.1458, lng: 79.0882, type: 'tier2', state: 'Maharashtra' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, type: 'tier2', state: 'Tamil Nadu' },
  'madurai': { lat: 9.9252, lng: 78.1198, type: 'tier2', state: 'Tamil Nadu' },
  'nainital': { lat: 29.3803, lng: 79.4636, type: 'small', state: 'Uttarakhand' },
  'dehradun': { lat: 30.3165, lng: 78.0322, type: 'tier2', state: 'Uttarakhand' },
  'haridwar': { lat: 29.9457, lng: 78.1642, type: 'small', state: 'Uttarakhand' },
  'tirupati': { lat: 13.6288, lng: 79.4192, type: 'tier2', state: 'Andhra Pradesh' },
  'rameswaram': { lat: 9.2876, lng: 79.3129, type: 'small', state: 'Tamil Nadu' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, type: 'small', state: 'Puducherry' },
  'puducherry': { lat: 11.9416, lng: 79.8083, type: 'small', state: 'Puducherry' },
  'andaman': { lat: 11.7401, lng: 92.6586, type: 'small', state: 'Andaman & Nicobar' },
  'port blair': { lat: 11.6234, lng: 92.7265, type: 'small', state: 'Andaman & Nicobar' },
  'khajuraho': { lat: 24.8318, lng: 79.9199, type: 'small', state: 'Madhya Pradesh' },
  'ajmer': { lat: 26.4499, lng: 74.6399, type: 'small', state: 'Rajasthan' },
  'pushkar': { lat: 26.4898, lng: 74.5511, type: 'small', state: 'Rajasthan' },
  'mount abu': { lat: 24.5926, lng: 72.7156, type: 'small', state: 'Rajasthan' },
  'kasol': { lat: 32.0101, lng: 77.3142, type: 'small', state: 'Himachal Pradesh' },
  'spiti': { lat: 32.2464, lng: 78.0349, type: 'small', state: 'Himachal Pradesh' },
  'hampi': { lat: 15.3350, lng: 76.4600, type: 'small', state: 'Karnataka' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, type: 'tier2', state: 'Maharashtra' },
  'lonavala': { lat: 18.7546, lng: 73.4062, type: 'small', state: 'Maharashtra' },
  'mahabaleshwar': { lat: 17.9307, lng: 73.6477, type: 'small', state: 'Maharashtra' },
};

// ─── Haversine Distance ─────────────────────────────────────────────────────
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Season/Weather Intelligence ────────────────────────────────────────────
function getSeasonInfo(month: number, state: string): string {
  const monsoon = [6, 7, 8, 9];
  const winter = [11, 12, 1, 2];
  const summer = [3, 4, 5, 10];

  const hillStates = ['himachal pradesh', 'uttarakhand', 'jammu & kashmir', 'ladakh', 'sikkim'];
  const isHill = hillStates.some(h => state.toLowerCase().includes(h));

  if (monsoon.includes(month)) {
    if (isHill) return 'MONSOON WARNING: Heavy rainfall, landslides possible. Carry rain gear. Some roads may be closed.';
    return 'Monsoon season: Expect rain. Carry umbrella and waterproof bags.';
  }
  if (winter.includes(month)) {
    if (isHill) return 'WINTER: Heavy snowfall possible. Carry warm layers. Some passes may close.';
    return 'Pleasant weather for travel.';
  }
  if (summer.includes(month)) {
    if (['rajasthan', 'uttar pradesh', 'madhya pradesh', 'bihar'].some(s => state.toLowerCase().includes(s)))
      return 'EXTREME HEAT WARNING: Temperatures can exceed 45°C. Stay hydrated. Avoid outdoor activities 12pm-4pm.';
    if (isHill) return 'Best season for hill stations. Pleasant weather.';
  }
  return 'Moderate weather expected.';
}

// ─── Suggest Transport Mode ─────────────────────────────────────────────────
function suggestTransport(distKm: number): string {
  if (distKm > 1200) return 'Flight recommended (6+ hrs by train). Book 2-3 weeks early for best fares.';
  if (distKm > 600) return 'Train (Rajdhani/Shatabdi) recommended for this distance. Book early.';
  if (distKm > 200) return 'Train or AC Volvo bus. Overnight trains save hotel cost + travel time.';
  if (distKm > 50) return 'Bus or taxi. Shared cabs available on most routes.';
  return 'Local auto/taxi/metro. Walk for nearby attractions.';
}

@Injectable()
export class ItineraryService {
  constructor(private configService: ConfigService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT VALIDATION — catches edge cases BEFORE calling AI
  // ═══════════════════════════════════════════════════════════════════════════
  private validateInputs(tripData: {
    name: string;
    fromCity: string;
    toCity: string;
    startDate: string;
    endDate: string;
    budget: number;
    tripType: string;
  }): { days: number; perDayBudget: number; warnings: string[]; distKm: number } {
    const warnings: string[] = [];

    // City validation
    if (!tripData.fromCity?.trim()) throw new BadRequestException('Departure city is required');
    if (!tripData.toCity?.trim()) throw new BadRequestException('Destination city is required');

    // Date validation
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw new BadRequestException('Invalid dates provided');

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days < 1) throw new BadRequestException('Trip must be at least 1 day');
    if (days > 30) throw new BadRequestException('Trip cannot exceed 30 days. Please split into multiple trips.');

    // Budget validation
    if (!tripData.budget || tripData.budget <= 0)
      throw new BadRequestException('Budget must be a positive number');
    if (tripData.budget < 1000)
      throw new BadRequestException('Budget too low for travel. Minimum ₹1,000 required for any meaningful trip.');

    const perDayBudget = Math.round(tripData.budget / days);

    if (perDayBudget < 500) {
      warnings.push(`⚠️ Very tight budget: ₹${perDayBudget}/day. Expect dormitory stays, roadside food, and public transport only.`);
    } else if (perDayBudget < 1500) {
      warnings.push(`💡 Budget-friendly trip: ₹${perDayBudget}/day. Expect budget hotels, local eateries, and shared transport.`);
    } else if (perDayBudget > 10000) {
      warnings.push(`✨ Luxury budget: ₹${perDayBudget}/day. Expect premium hotels, fine dining, and private transport.`);
    }

    // Distance calculation
    const fromCityData = KNOWN_CITIES[tripData.fromCity.toLowerCase().trim()];
    const toCityData = KNOWN_CITIES[tripData.toCity.toLowerCase().trim()];
    let distKm = 0;
    if (fromCityData && toCityData) {
      distKm = getDistanceKm(fromCityData.lat, fromCityData.lng, toCityData.lat, toCityData.lng);
      // Unrealistic travel check
      if (distKm > 800 && days <= 2) {
        warnings.push(`⚠️ ${Math.round(distKm)}km distance with only ${days} days is very tight. Consider flying or extending trip.`);
      }
    }

    // Seasonal warnings
    const travelMonth = start.getMonth() + 1;
    if (toCityData) {
      const seasonWarning = getSeasonInfo(travelMonth, toCityData.state);
      if (seasonWarning.includes('WARNING')) {
        warnings.push(`🌦️ ${seasonWarning}`);
      }
    }

    return { days, perDayBudget, warnings, distKm };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERATE ITINERARY — Production-grade AI Travel Planning
  // ═══════════════════════════════════════════════════════════════════════════
  async generateItinerary(
    tripData: {
      name: string;
      fromCity: string;
      toCity: string;
      startDate: string;
      endDate: string;
      budget: number;
      tripType: string;
      description?: string;
    },
    customPrompt?: string,
  ): Promise<string> {

    // ── Step 1: Validate & Compute Intelligence ──
    const { days, perDayBudget, warnings, distKm } = this.validateInputs(tripData);

    const fromCityData = KNOWN_CITIES[tripData.fromCity.toLowerCase().trim()];
    const toCityData = KNOWN_CITIES[tripData.toCity.toLowerCase().trim()];

    const budgetTier = perDayBudget < 1500 ? 'Budget' : perDayBudget < 5000 ? 'Mid-Range' : 'Luxury';
    const transportSuggestion = distKm > 0 ? suggestTransport(distKm) : 'Suggest appropriate transport.';

    const toCityType = toCityData?.type || 'tier2';
    const costMultiplier = toCityType === 'metro' ? '1.3x (metro city premium)' : toCityType === 'small' ? '0.7x (small town savings)' : '1x (standard)';

    // Budget distribution based on city type and duration
    const budgetDistribution = {
      transport: Math.round(tripData.budget * (distKm > 600 ? 0.30 : 0.20)),
      accommodation: Math.round(tripData.budget * (budgetTier === 'Luxury' ? 0.35 : 0.25)),
      food: Math.round(tripData.budget * 0.20),
      activities: Math.round(tripData.budget * (budgetTier === 'Budget' ? 0.10 : 0.15)),
      misc: 0,
    };
    budgetDistribution.misc = tripData.budget - budgetDistribution.transport - budgetDistribution.accommodation - budgetDistribution.food - budgetDistribution.activities;

    const travelMonth = new Date(tripData.startDate).getMonth() + 1;
    const season = toCityData ? getSeasonInfo(travelMonth, toCityData.state) : '';

    // Extra instructions from admin (optional)
    const extraInstructions = customPrompt?.trim()
      ? `\n\nADDITIONAL INSTRUCTIONS FROM THE TRAVELER (MUST follow these):\n${customPrompt.trim()}`
      : '';

    // ── Step 2: Build the Expert Prompt ──
    const prompt = `You are a SENIOR Indian travel planner and safety expert working for YatraSecure, a production travel platform used by thousands. Generate a HIGHLY REALISTIC, VALIDATED, and SAFETY-AWARE itinerary.

═══ TRIP DETAILS ═══
Trip: ${tripData.name}
Route: ${tripData.fromCity} → ${tripData.toCity}
Distance: ~${distKm > 0 ? Math.round(distKm) + ' km' : 'Unknown — estimate yourself'}
Duration: ${days} days (${tripData.startDate} to ${tripData.endDate})
Total Budget: ₹${tripData.budget.toLocaleString('en-IN')} (${budgetTier} tier)
Per-day Budget: ~₹${perDayBudget.toLocaleString('en-IN')}
Trip Type: ${tripData.tripType}
${tripData.description ? `Notes: ${tripData.description}` : ''}
Travel Month: ${travelMonth} (${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][travelMonth - 1]})
Season Alert: ${season}
City Cost Level: ${costMultiplier}
Transport Suggestion: ${transportSuggestion}
${extraInstructions}

═══ BUDGET DISTRIBUTION (must match total) ═══
Transport: ~₹${budgetDistribution.transport.toLocaleString('en-IN')}
Accommodation: ~₹${budgetDistribution.accommodation.toLocaleString('en-IN')}
Food: ~₹${budgetDistribution.food.toLocaleString('en-IN')}
Activities: ~₹${budgetDistribution.activities.toLocaleString('en-IN')}
Misc: ~₹${budgetDistribution.misc.toLocaleString('en-IN')}

═══ RULES (CRITICAL — follow ALL) ═══
1. HUMAN STORYTELLING: DO NOT use robotic format like "Morning / Afternoon / Evening". Instead use storytelling flow.
2. ACTIVITIES CAP: Max 3–4 meaningful activities per day. Avoid overcrowding. Cluster nearby locations together to avoid backtracking routes.
3. REALISTIC PRICING: Use real-world Indian prices. No random numbers. Budget hotel in tier-2 = ₹800-1500, metro = ₹1500-3000. Street food meal = ₹50-150. Restaurant = ₹200-600.
4. COST RANGES: For each activity, provide realistic cost ranges (e.g. "₹500–₹1000").
5. TRAVEL TIME: Include realistic travel time between stops. Add buffer time for rest.
6. CONTEXTUAL SAFETY: Add 1-2 specific safety tips ONLY where relevant (e.g. scam warnings, night safety) in the flow. Do not dump generic safety sections.
7. MATCH BUDGET: Total of all daily costs MUST approximately equal total budget. Don't inflate or deflate.
8. PERSONALIZATION: Adapt the plan based on the budget tier, travel style, and duration.
9. MARK BEST EXPERIENCE: Each day must have one ⭐ best experience.

Return ONLY this exact JSON (no markdown, no code blocks, no extra text):
{
  "summary": "2-3 line compelling trip overview",
  "whyThisPlan": "1-2 lines explaining route logic and why this plan is optimal",
  "budgetTier": "${budgetTier}",
  "totalBudgetBreakdown": {
    "transport": ${budgetDistribution.transport},
    "accommodation": ${budgetDistribution.accommodation},
    "food": ${budgetDistribution.food},
    "activities": ${budgetDistribution.activities},
    "misc": ${budgetDistribution.misc}
  },
  "warnings": ${JSON.stringify(warnings.length > 0 ? warnings : [])},
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Descriptive storytelling title (e.g., 'Beach Relaxation Day')",
      "bestExperience": "The one highlight activity of this day ⭐",
      "flow": [
        {
          "activity": "Activity name",
          "description": "Storytelling description: Start your day with... / Then head to... / Later... / End your day with...",
          "travel_time": "Estimated travel time from previous location",
          "cost_range": "₹500–₹1000",
          "tip": "Contextual safety or insider tip (Optional alternative if user wants to skip)"
        }
      ],
      "stay": { "name": "Hotel/Hostel name or type", "cost": 0, "lat": 0.0, "lng": 0.0 },
      "transport": "Exact transport mode with timing and reasoning",
      "transportMode": "flight|train|bus|auto|walk|taxi",
      "safetyTips": ["Specific safety tip ONLY if highly relevant for this day"],
      "estimated_daily_cost": 0
    }
  ],
  "general_tips": ["tip1", "tip2", "tip3"],
  "scamWarnings": ["Common scams at this destination"],
  "emergency_contacts": {
    "police": "100",
    "ambulance": "108",
    "tourist_helpline": "1800-11-1363"
  },
  "mapData": {
    "center": { "lat": ${toCityData?.lat || 20.5937}, "lng": ${toCityData?.lng || 78.9629} },
    "zoom": ${distKm > 500 ? 5 : distKm > 100 ? 7 : 10}
}
`;

    // ── Step 3: Call Groq AI ──
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.configService.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are YatraSecure's expert Indian travel planner. You create production-quality itineraries that feel like they were made by a real travel expert. You ONLY respond with valid JSON. No markdown, no code blocks, no explanation. Just the raw JSON object. Every price must be realistic. Every route must be logical. Every safety tip must be specific to the location.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 6000,
        temperature: 0.75,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Groq API call failed');
    }

    const data = await res.json();
    const raw = data.choices[0].message.content as string;

    // Safety: extract JSON if model wraps in markdown
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;

    // Validate JSON
    try {
      const parsed = JSON.parse(jsonStr);

      // Inject server-side warnings that AI might have missed
      if (!parsed.warnings) parsed.warnings = [];
      for (const w of warnings) {
        if (!parsed.warnings.includes(w)) parsed.warnings.push(w);
      }

      // Ensure budgetTier is set
      if (!parsed.budgetTier) parsed.budgetTier = budgetTier;

      return JSON.stringify(parsed);
    } catch {
      throw new Error('AI returned invalid JSON — please try regenerating');
    }
  }
}
