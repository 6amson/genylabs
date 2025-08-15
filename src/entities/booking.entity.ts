import { BookingStatus } from '../types/statics';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';


@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { name: 'user_id' })
  @Index()
  userId: number;

  @Column('varchar', { name: 'client_name', length: 255 })
  clientName: string;

  @Column('varchar', { name: 'service_type', length: 255 })
  serviceType: string;

  @Column('timestamp', { name: 'scheduled_at' })
  scheduledAt: Date;

  @Column('integer', { name: 'duration' })
  duration: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}