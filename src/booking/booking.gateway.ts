import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Booking } from '../entities/booking.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'bookings',
})
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  broadcastBookingCreated(booking: Booking) {
    this.server.emit('booking.created', booking, () => {
      console.log('📨 Client booking sent');
    });
  }

}