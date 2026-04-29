import { IsString, IsBoolean, IsNumber, IsOptional, IsIn } from 'class-validator';

export class SafetyScoreDto {
  @IsString()
  @IsIn(['normal', 'asthma', 'female'])
  user_type: 'normal' | 'asthma' | 'female' = 'normal';

  @IsBoolean()
  is_night: boolean = false;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;

  @IsOptional()
  @IsString()
  grid_id?: string;
}
