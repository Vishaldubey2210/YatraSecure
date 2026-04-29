import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SafetyScoreDto } from './dto/safety-score.dto';

// ML FastAPI server (safety-engine) runs on port 8000
const ML_API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface SafetyScoreResult {
  safety_score: number;
  alert_band: string;
  explanations: string[];
  weights_used?: Record<string, number>;
  location?: { grid_id: string };
}

@Injectable()
export class SafetyService {
  private readonly logger = new Logger(SafetyService.name);

  async getSafetyScore(dto: SafetyScoreDto): Promise<SafetyScoreResult> {
    const payload = {
      user_type: dto.user_type ?? 'normal',
      is_night: dto.is_night ?? false,
      lat: dto.lat ?? null,
      lon: dto.lon ?? null,
      grid_id: dto.grid_id ?? null,
    };

    this.logger.log(`Requesting safety score: ${JSON.stringify(payload)}`);

    let response: Response;
    try {
      response = await fetch(`${ML_API_BASE}/safety-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
    } catch (err) {
      this.logger.error(`ML service unreachable: ${err.message}`);
      throw new HttpException(
        'Safety engine offline. Please start the ML service.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`ML API error ${response.status}: ${errorBody}`);
      throw new HttpException(
        `ML API error: ${response.statusText}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = await response.json() as any;

    // Flatten the nested ML response into a clean format
    return {
      safety_score: data.metrics?.safety_score ?? 0,
      alert_band: data.metrics?.alert_band ?? '⚪ Unknown',
      explanations: data.metrics?.explanations
        ? data.metrics.explanations.split(', ').filter(Boolean)
        : [],
      weights_used: data.metrics?.weights_used ?? {},
      location: data.location ?? {},
    };
  }
}
