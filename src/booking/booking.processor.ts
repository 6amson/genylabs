import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Processor('reminder')
@Injectable()
export class BookingProcessor {
  private readonly logger = new Logger(BookingProcessor.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job<{ bookingId: string }>) {
    const { bookingId } = job.data;
    
    const booking = await this.bookingRepository.findOne({ where: { id: Number(bookingId) } });
    
    if (!booking || booking.status === 'cancelled') {
      this.logger.log(`Skipping reminder for cancelled/missing booking: ${bookingId}`);
      return;
    }

    this.logger.log(`Sending reminder for booking: ${bookingId}`);
    
    // In a production environment, this would send email/SMS/push notification
    // For now, we just log it
    this.logger.log(`Reminder: Booking ${booking.serviceType} starts in 10 minutes`);
  }
}