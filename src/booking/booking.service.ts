import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Booking } from '../entities/booking.entity';
import { BookingQueryDto, CreateBookingDto } from '../dto/booking.dto';
import { JwtPayload } from '../guard/auth.guard';
import { BookingGateway } from './booking.gateway';
import { BookingStatus, BookingTimeFilter } from 'src/types/statics';
import { User } from 'src/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('reminder') private reminderQueue: Queue,
    private bookingGateway: BookingGateway,
  ) { }

  async create(createBookingDto: CreateBookingDto, user: JwtPayload): Promise<Booking> {
    // Only providers can create bookings for themselves or admins can create any
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      scheduledAt: new Date(createBookingDto.scheduledAt),
      userId: Number(user.sub),
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Schedule reminder job (10 minutes before)
    const reminderTime = new Date(savedBooking.scheduledAt.getTime() - 10 * 60 * 1000);
    if (reminderTime > new Date()) {
      await this.reminderQueue.add(
        'send-reminder',
        { bookingId: savedBooking.id },
        { delay: reminderTime.getTime() - Date.now(), attempts: 3, backoff: 5000, removeOnComplete: true }
      );
    }

    // Broadcast via WebSocket
    this.bookingGateway.broadcastBookingCreated(savedBooking);

    return savedBooking;
  }

  async findOne(id: string, user: JwtPayload): Promise<Booking> {
    let this_id = Number(id);
    const result: Booking = await this.bookingRepository.manager.query(`
      SELECT b.*, u.email as ProviderEmail
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
      `, [this_id]);

    let booking = result[0];

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Providers can only see their own bookings, admins can see all
    if (user.role === 'provider' && booking.user_id !== Number(user.sub)) {
      throw new ForbiddenException('Cannot access this booking');
    }
    console.log(booking);
    return booking;
  }

  async findMany(query: BookingQueryDto, user: JwtPayload) {
    const { page, limit, filter } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .orderBy('booking.scheduled_at', 'ASC')
      .skip(skip)
      .take(limit);

    // Filter by user role
    if (user.role === 'provider') {
      queryBuilder.where('booking.user_id = :userId', { userId: user.sub });
    }

    // Apply time filter
    if (filter) {
      const now = new Date();
      if (filter === BookingTimeFilter.UPCOMING) {
        queryBuilder.andWhere('booking.scheduled_at > :now', { now });
      } else if (filter === BookingTimeFilter.PAST) {
        queryBuilder.andWhere('booking.scheduled_at < :now', { now });
      }
    }

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
