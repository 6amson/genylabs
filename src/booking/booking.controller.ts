import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto, BookingQueryDto } from '../dto/booking.dto';
import { AuthGuard } from '../guard/auth.guard';
import { Roles } from '../guard/auth.decorator';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles('provider', 'admin')
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingService.create(createBookingDto, req.user);
  }

  @Get(':id')
  @Roles('provider', 'admin')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingService.findOne(id, req.user);
  }

  @Get()
  @Roles('provider', 'admin')
  findMany(@Query() query: BookingQueryDto, @Request() req) {
    return this.bookingService.findMany(query, req.user);
  }
}
