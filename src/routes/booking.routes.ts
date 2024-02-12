// routes/bookingRoutes.ts
import express from 'express';
import { createBooking, getAllBookings, manageBookings } from '../controllers/booking.controller';

const router = express.Router()

router

    // Create a Booking
    .post('/', createBooking)

    // Get all bookings
    .get('/', getAllBookings)

    // Update Booking Informations by bookingId
    .put('/:bookingId', manageBookings)

// .get('/bookings/:userId', getAllBookingsForUser)

// .get('/hosts/:hostId/bookings', getAllBookingsForHost)

module.exports = router;