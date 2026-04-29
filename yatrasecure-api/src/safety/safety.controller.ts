import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SafetyService } from './safety.service';
import { SafetyScoreDto } from './dto/safety-score.dto';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  /**
   * POST /api/safety/score
   * Proxies to ML FastAPI and returns safety score
   */
  @Post('score')
  async getSafetyScore(@Body() dto: SafetyScoreDto) {
    try {
      return await this.safetyService.getSafetyScore(dto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Safety engine unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
