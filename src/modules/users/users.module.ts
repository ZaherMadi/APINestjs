import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Boat } from '../boats/entities/boat.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { LogbookEntry } from '../logbook/entities/logbook-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Boat, Trip, Booking, LogbookEntry])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporter pour utilisation dans d'autres modules
})
export class UsersModule {}
