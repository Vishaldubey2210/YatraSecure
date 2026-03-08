import { IsString, IsOptional, MaxLength } from 'class-validator';

export class JoinTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
