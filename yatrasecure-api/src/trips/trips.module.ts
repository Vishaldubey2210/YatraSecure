import { Module }           from '@nestjs/common';
import { ConfigModule }     from '@nestjs/config';
import { TripsService }     from './trips.service';
import { TripsController }  from './trips.controller';
import { ItineraryService } from './itinerary.service';
import { PrismaModule }     from '../prisma/prisma.module';

@Module({
  imports:     [PrismaModule, ConfigModule],
  controllers: [TripsController],
  providers:   [TripsService, ItineraryService],
  exports:     [TripsService],
})
export class TripsModule {}
