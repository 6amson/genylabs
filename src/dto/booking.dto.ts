import { IsString, IsUUID, IsDateString, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus, BookingTimeFilter } from 'src/types/statics';


export class CreateBookingDto {
  @IsString()
  clientName: string;

  @IsString()
  serviceType: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}


export class BookingQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(BookingTimeFilter)
  filter?: BookingTimeFilter;
}