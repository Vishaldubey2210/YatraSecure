import { IsString, IsNumber, IsBoolean, IsDateString, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  fromCity: string;

  @IsString()
  @MaxLength(100)
  toCity: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsString()
  tripType: string; // "solo" | "group" | "family" etc.

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
