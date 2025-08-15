import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';
import { BookingModule } from './booking/booking.module';
import { HealthModule } from './health/health.module';
import { dataSourceOptions } from './data-source';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        username: "default",
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '24h' },
    }),
    TerminusModule,
    BookingModule,
    HealthModule,
    UserModule
  ],
})
export class AppModule { }