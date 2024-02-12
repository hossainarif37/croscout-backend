// routes/bookingRoutes.ts
import express from 'express';
import { createBooking } from '../controllers/booking.controller';

const router = express.Router()

router

    // Create a Booking
    .post('/', createBooking)

// .get('/bookings/:userId', getAllBookingsForUser)

// .get('/hosts/:hostId/bookings', getAllBookingsForHost)

module.exports = router;