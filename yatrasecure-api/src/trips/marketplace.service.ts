import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

@Injectable()
export class MarketplaceService {
  private groq: Groq;
  private readonly logger = new Logger(MarketplaceService.name);
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 1000 * 60 * 20; // 20 minutes

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== 'PASTE_YOUR_GROQ_API_KEY_HERE') {
      this.groq = new Groq({ apiKey });
      this.logger.log('Groq AI initialized for Marketplace');
    } else {
      this.logger.warn('GROQ_API_KEY missing. Marketplace will run in Demo Mode.');
    }
  }

  async getMarketplaceOfferings(category?: string, city?: string) {
    const cacheKey = `${city || 'global'}_${category || 'all'}`.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log(`Cache hit for marketplace: ${cacheKey}`);
      return cached.data;
    }

    const prompt = `You are an elite AI booking assistant working with real-world constraints.

Before returning any travel deal or booking link, THINK deeply and validate everything.

## Step 1: Link Validation
* Ensure every URL is real, accessible, and not broken
* Reject any link that returns 404, 403, or requires session-based access
* Prefer official booking pages over redirects

## Step 2: Price Realism Check
* Reject impossible deals (e.g. ₹1 flights, ₹100 luxury hotels)
* Compare against normal market range
* If unrealistic, correct it or discard it

## Step 3: Source Trust
* Prefer: Official booking sites, Verified aggregators
* Avoid: Unknown or spammy domains

## Step 4: Deduplication
* Remove duplicate deals
* Keep only the best version

## Step 5: Personalization
Match deals based on the location.
${city ? `Focus strictly on deals for the city of ${city}.` : 'Focus on popular global travel destinations.'}
${category ? `Category filter: ${category}.` : ''}

## Step 6: Smart Ranking
Rank deals by:
1. Value for money
2. Location convenience
3. Ratings (if available)
4. Reliability of source

## Step 7: Output Rules
Return ONLY high-quality, working deals:
{
  "deals": [
    {
      "id": "unique-id-string",
      "title": "Title of the deal",
      "price_range": "e.g., ₹2500 - ₹3500",
      "provider": "Provider Name",
      "link": "https://www.makemytrip.com/...",
      "why_this": "Why this deal is optimal",
      "trust_score": "High/Medium/Low",
      "category": "Adventure / Food / Culture / Stays / Flights"
    }
  ]
}

## Critical Rule:
If no valid deals are found:
* DO NOT hallucinate
* Return "No reliable deals found right now" (but inside valid JSON like {"deals": []})

Think like a human travel expert who cares about trust and realism. Never prioritize quantity over quality.
Return ONLY valid JSON.`;

    for (const model of MODELS) {
      try {
        if (!this.groq) throw new Error('Groq not initialized');

        this.logger.log(`Trying model ${model} for marketplace: ${cacheKey}`);
        const completion = await this.groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model,
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('AI returned no content');

        const result = JSON.parse(content);
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } catch (error) {
        this.logger.warn(`Model ${model} failed for marketplace ${cacheKey}: ${(error as any)?.message}`);
        continue;
      }
    }

    this.logger.error(`All models failed for marketplace: ${cacheKey}`);
    return this.getDemoOfferings(city, category);
  }

  private getDemoOfferings(city?: string, category?: string) {
    const loc = city || 'Various Locations';
    return {
      deals: [
        { id: 'deal-1', title: `Premium Stay at ${loc} Heights`, price_range: '₹4,500 - ₹6,000', provider: 'MakeMyTrip', link: 'https://www.makemytrip.com/', why_this: 'Top-rated hotel with excellent location and verified reviews.', trust_score: 'High', category: 'Stays' },
        { id: 'deal-2', title: `Guided Heritage Walk in ${loc}`, price_range: '₹1,200 - ₹1,500', provider: 'Viator', link: 'https://www.viator.com/', why_this: 'Highly rated by solo travelers, covers all major historical sites.', trust_score: 'High', category: 'Culture' },
        { id: 'deal-3', title: `Flight to ${loc}`, price_range: '₹5,500 - ₹8,000', provider: 'Skyscanner', link: 'https://www.skyscanner.co.in/', why_this: 'Best value for money based on historical pricing.', trust_score: 'High', category: 'Flights' },
      ],
      _mode: 'demo'
    };
  }
}
