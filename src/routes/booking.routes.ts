// routes/bookingRoutes.ts
import express from 'express';
import { createBooking, manageBookings } from '../controllers/booking.controller';

const router = express.Router()

router

    // Create a Booking
    .post('/', createBooking)

    // Update Booking Informations by bookingId
    .put('/:bookingId', manageBookings)

// .get('/bookings/:userId', getAllBookingsForUser)

// .get('/hosts/:hostId/bookings', getAllBookingsForHost)

module.exports = router;