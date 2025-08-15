import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { BookingService } from '../src/booking/booking.service';
import { BookingGateway } from '../src/booking/booking.gateway';
import { ForbiddenException } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { User } from 'src/entities/user.entity';
import { BookingStatus } from 'src/types/statics';


describe('BookingService', () => {
  let service: BookingService;
  let mockRepository: any;
  let mockQueue: any;
  let mockGateway: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };

    mockQueue = {
      add: jest.fn(),
    };

    mockGateway = {
      broadcastBookingCreated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken('reminder'),
          useValue: mockQueue,
        },
        {
          provide: BookingGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should create booking for provider', async () => {
    // Use a future date to ensure reminder gets scheduled
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const createDto = {
      clientName: 'John Doe',
      serviceType: 'consultation',
      scheduledAt: futureDate.toISOString(),
      duration: 60,
      notes: 'Initial consultation',
    };

    const user = { sub: '1', role: 'provider' as const };
    
    const createdBooking = {
      ...createDto,
      scheduledAt: new Date(createDto.scheduledAt),
      userId: Number(user.sub),
      status: BookingStatus.PENDING,
    };

    // The saved booking object (what save returns) - should have scheduledAt as Date
    const savedBooking = { 
      id: 'booking-789', 
      ...createdBooking, // This ensures scheduledAt remains a Date object
    };

    mockRepository.create.mockReturnValue(createdBooking);
    mockRepository.save.mockResolvedValue(savedBooking);

    const result = await service.create(createDto, user);
    // console.log(result);

    expect(mockRepository.create).toHaveBeenCalledWith({
      ...createDto,
      scheduledAt: new Date(createDto.scheduledAt),
      userId: Number(user.sub),
      status: BookingStatus.PENDING,
    });
    expect(mockQueue.add).toHaveBeenCalled(); // Verify reminder was scheduled
    expect(mockGateway.broadcastBookingCreated).toHaveBeenCalledWith(savedBooking);
    expect(result).toEqual(savedBooking);
  });

  it('should create booking without scheduling reminder for past dates', async () => {
    // Test that no reminder is scheduled when the booking time is in the past
    const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const createDto = {
      clientName: 'Jane Doe',
      serviceType: 'follow-up',
      scheduledAt: pastDate.toISOString(),
      duration: 30,
      notes: 'Follow-up consultation',
    };

    const user = { sub: '2', role: 'provider' as const };
    
    const createdBooking = {
      ...createDto,
      scheduledAt: new Date(createDto.scheduledAt),
      userId: Number(user.sub),
      status: BookingStatus.PENDING,
    };

    const savedBooking = { 
      id: 'booking-456', 
      ...createdBooking,
    };

    mockRepository.create.mockReturnValue(createdBooking);
    mockRepository.save.mockResolvedValue(savedBooking);

    const result = await service.create(createDto, user);

    expect(result).toEqual(savedBooking);
    expect(mockGateway.broadcastBookingCreated).toHaveBeenCalledWith(savedBooking);
    // No reminder should be scheduled for past dates
    expect(mockQueue.add).not.toHaveBeenCalled();
  });
});