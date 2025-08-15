import { UserType } from 'src/types/statics';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255, unique: true, nullable: false })
  email: string;

  @Column('varchar', { length: 255, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.PROVIDER,
  })
  role: UserType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

