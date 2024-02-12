// routes/bookingRoutes.ts
import express from 'express';
import { createBooking, deleteBooking, getAllBookings, getBookingById, getGuestBookings, manageBookings } from '../controllers/booking.controller';
import { checkAuth } from '../middleware/authentication';

const router = express.Router()

router

    // Create a Booking
    .post('/', createBooking)

    // Get all bookings
    .get('/', getAllBookings)

    // Get booking by bookingId
    .get('/:bookingId', getBookingById)

    // Route for guests to get their bookings
    .get('/guest', checkAuth, getGuestBookings)



    // Update Booking Informations by bookingId
    .put('/:bookingId', manageBookings)

    // Update Booking Informations by bookingId
    .delete('/:bookingId', deleteBooking)

// .get('/bookings/:userId', getAllBookingsForUser)

// .get('/hosts/:hostId/bookings', getAllBookingsForHost)

module.exports = router;