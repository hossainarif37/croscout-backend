// routes/bookingRoutes.ts
import express from 'express';
import { createBooking, deleteBooking, getAllBookings, getBookingById, getBookingsByRole, manageBookings, submitTransactionId, updatePaymentDetails } from '../controllers/booking.controller';
import { checkAuth } from '../middleware/authentication';

const router = express.Router()

router

    // Create a Booking
    .post('/', createBooking)

    // Get all bookings
    .get('/', getAllBookings)

    // Get booking by bookingId
    .get('/:bookingId', getBookingById)

    // Get bookings based on role
    .get('/user/:userId', getBookingsByRole)


    // Update Booking Informations by bookingId
    .put('/:bookingId', manageBookings)

    // Update Booking Informations by bookingId
    .delete('/:bookingId', deleteBooking)

    // Update payment details for a booking.
    .put('/:bookingId/payment-details', updatePaymentDetails)

    // Submit the transaction ID for a booking.
    .post('/:bookingId/transaction-id', submitTransactionId)


// .get('/bookings/:userId', getAllBookingsForUser)

// .get('/hosts/:hostId/bookings', getAllBookingsForHost)

module.exports = router;