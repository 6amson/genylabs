import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingGateway } from './booking.gateway';
import { BookingProcessor } from './booking.processor';
import { Booking } from '../entities/booking.entity';
import { AuthGuard } from 'src/guard/auth.guard';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User]),
    BullModule.registerQueue({
      name: 'reminder',
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingGateway, BookingProcessor, AuthGuard,],

  exports: [BookingService],
})
export class BookingModule {}
