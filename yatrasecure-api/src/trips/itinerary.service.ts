import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ItineraryService {
  constructor(private configService: ConfigService) {}

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

    const days = Math.ceil(
      (new Date(tripData.endDate).getTime() - new Date(tripData.startDate).getTime())
      / (1000 * 60 * 60 * 24),
    ) + 1;

    // Extra instructions from admin (optional)
    const extraInstructions = customPrompt?.trim()
      ? `\n\nAdditional instructions from the trip admin (must be followed):\n${customPrompt.trim()}`
      : '';

    const prompt = `Create a detailed day-by-day travel itinerary for this Indian trip and return ONLY valid JSON (no markdown, no code blocks, no extra text):

Trip: ${tripData.name}
From: ${tripData.fromCity} → To: ${tripData.toCity}
Duration: ${days} days (${tripData.startDate} to ${tripData.endDate})
Budget: ₹${tripData.budget}
Type: ${tripData.tripType}
${tripData.description ? `Notes: ${tripData.description}` : ''}${extraInstructions}

Return ONLY this exact JSON structure with no extra text before or after:
{
  "summary": "2-3 line trip overview",
  "totalBudgetBreakdown": {
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "misc": 0
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "morning":   { "activity": "...", "place": "...", "tip": "...", "cost": 0 },
      "afternoon": { "activity": "...", "place": "...", "tip": "...", "cost": 0 },
      "evening":   { "activity": "...", "place": "...", "tip": "...", "cost": 0 },
      "meals": { "breakfast": "...", "lunch": "...", "dinner": "..." },
      "transport": "...",
      "safety_tip": "...",
      "estimated_daily_cost": 0
    }
  ],
  "general_tips": ["tip1", "tip2", "tip3"],
  "emergency_contacts": {
    "police": "100",
    "ambulance": "108",
    "tourist_helpline": "1800-11-1363"
  }
}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.configService.get('GROQ_API_KEY')}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Indian travel planner. You ONLY respond with valid JSON. No markdown, no code blocks, no explanation. Just raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens:      3000,
        temperature:     0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq API call failed');
    }

    const data = await res.json();
    const raw  = data.choices[0].message.content as string;

    // Safety: extract JSON if model accidentally wraps in markdown
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr   = jsonMatch ? jsonMatch[0] : raw;

    // Validate before returning
    try {
      JSON.parse(jsonStr);
    } catch {
      throw new Error('AI returned invalid JSON — please try regenerating');
    }

    return jsonStr;
  }
}
