
# Bookings Microservice

Minimal booking service for solo providers with real-time notifications.

## Assumptions & Decisions

- **Provider-centric**: Only providers can create bookings for themselves, admins see all
- **Simple status flow**: pending → confirmed → completed (cancelled anytime)
- **10min reminders**: Assumes bookings are 30+ minutes long
- **NestJS + TypeORM**: Fast development with type safety
- **Redis Bull**: Reliable job processing with retries

## Setup Instructions

```bash
# Install
npm install

# Environment (.env)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
REDIS_HOST=your-redis-host
REDIS_PORT=15840
REDIS_PASSWORD=your-password
JWT_SECRET=your-secret

# Database
npm run build && npm run migration:run
```

## How to Run Locally & Test

```bash
# Start
npm run start:dev

# Test token (Node console)
const jwt = require('jsonwebtoken');
console.log(jwt.sign({sub: '1', role: 'provider'}, 'your-secret'));

# Create booking
curl -X POST http://localhost:3000/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clientName": "John Doe", "serviceType": "Haircut", "scheduledAt": "2025-08-20T14:30:00Z","duration": 60,"notes": "Customer requested a quiet room."}'

# List bookings
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/bookings?filter=upcoming&page=1&limit=10"

# Tests
npm test && npm run test:e2e
```

### OR

```bash
# Build & start containers
docker-compose up --build -d

# Run migrations inside the app container
docker-compose exec app npm run build
docker-compose exec app npm run migration:run
```


## Improvements

1. **Conflict detection** (1h) - Prevent double-booking same time slot
2. **Rate limiting** (30min) - Add @nestjs/throttler 
3. **Better validation** (1h) - Custom decorators, booking time constraints
4. **Monitoring** (1.5h) - Structured logging, metrics, error tracking
