import { DataSource } from "typeorm";
import { Booking } from "./entities/booking.entity";
import * as dotenv from 'dotenv';
import { User } from "./entities/user.entity";

dotenv.config();

export const dataSourceOptions = {
  type: "postgres" as const,
  url: process.env.DATABASE_URL,
  entities: [Booking, User], 
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  autoLoadEntities: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
