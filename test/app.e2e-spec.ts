import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({ sub: 1, role: 'provider' });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve booking', async () => {
    const createDto = {
      clientName: 'John Doe',
      serviceType: 'consultation',
      scheduledAt: '2024-12-01T10:00:00Z',
      duration: 60,
      notes: 'Initial consultation',
    };

    // Create booking
    const createResponse = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createDto)
      .expect(201);

    const createdBooking = createResponse.body;
    // console.log("Response", createdBooking.clientName);
    expect(createdBooking.userId).toBe(1);
    expect(createdBooking.clientName).toBe(createDto.clientName);
    expect(createdBooking.serviceType).toBe(createDto.serviceType);
    expect(createdBooking.status).toBe('pending');

    // Get booking by ID
    await request(app.getHttpServer())
      .get(`/bookings/${createdBooking.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdBooking.id);
        expect(res.body.client_name).toBe(createDto.clientName);
        expect(res.body.service_type).toBe(createDto.serviceType);
        expect(res.body.status).toBe('pending');
      });

    // List bookings
    await request(app.getHttpServer())
      .get('/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ page: 1, limit: 10, filter: 'upcoming' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.pagination).toBeDefined();
      });
  });
});