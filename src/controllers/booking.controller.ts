import { Request, Response, NextFunction } from 'express';
import Booking, { IBooking } from '../models/booking.model';
import Property, { IProperty } from '../models/property.model';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Define the Owner interface
interface IOwner {
    _bookingId: mongoose.Types.ObjectId;
    email: string;
    name: string;
}

interface IGuest {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
}



// Transporter of Nodemailer for Sending mail
const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_ID
    }
});

// Create Booking for a Property
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guestId, propertyId, startDate, endDate } = req.body;

        // Find the property and cast the owner to the IOwner interface
        const property = await Property.findById(propertyId).populate('owner') as IProperty & { owner: IOwner };
        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        // Check if the property is already booked for the same dates
        const existingBooking = await Booking.findOne({
            propertyId: propertyId,
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                },
                {
                    startDate: { $gte: startDate, $lte: endDate }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ success: false, error: 'Property already booked for the selected dates.' });
        }

        // Create a new booking
        const booking = new Booking({
            guestId,
            propertyId,
            startDate,
            endDate,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await booking.save();

        // Update the bookedDates array with the new booking range
        property.bookedDates.push({ startDate, endDate });

        // Save the updated property
        await property.save();

        const gmailUser = process.env.GMAIL_USER;
        if (!gmailUser) {
            throw new Error('GMAIL_USER is not set');
        }

        const mailOptions = {
            from: {
                name: "Croscout",
                address: gmailUser
            },
            to: property.owner.email, // Assuming the owner has an email field
            subject: 'New Booking Confirmation',
            text: `Hello ${property.owner.name}, a new booking has been made for your property.`,
            html: `<b>Hello ${property.owner.name},</b><br><p>A new booking has been made for your property.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log(`Email sent: ${info.response}`);
            }
        });

        res.status(201).json({ success: true, message: 'Booking successfully created', booking });
    } catch (error) {
        console.error(error);
        next(error);
    }
};


// Manage the booking
export const manageBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const { action } = req.body;

        // Find the booking by ID
        const booking = await Booking.findById(bookingId).populate('guestId') as IBooking & { guestId: IGuest }
        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        let message = '';
        if (action === 'confirm') {
            booking.status = 'confirmed';
            message = 'Your booking has been confirmed.';
        } else if (action === 'reject') {
            booking.status = 'rejected';
            message = 'Your booking has been rejected.';
        } else if (action === 'cancel') {
            booking.status = 'cancelled';
            message = 'Your booking has been cancelled.';
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action.' });
        }


        await booking.save();

        const gmailUser = process.env.GMAIL_USER;
        if (!gmailUser) {
            throw new Error('GMAIL_USER is not set');
        }

        // Send email to the guest
        const mailOptions = {
            from: {
                name: "Croscout",
                address: gmailUser
            },
            to: booking.guestId.email, // Assuming the guest has an email field
            subject: `Booking Status Update: ${booking.status}`,
            text: `Hello ${booking.guestId.name}, your booking has been ${booking.status}.`,
            html: `<b>Hello ${booking.guestId.name},</b><br><p>Your booking has been ${booking.status}.</p>`
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log(`Email sent: ${info.response}`);
            }
        });

        return res.json({ success: true, message: `Booking ${booking.status}.` });

    } catch (error) {
        console.error(error);
        next(error);
    }
};


// Get All Bookings
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings: IBooking[] = await Booking.find().exec();
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        next(error);
    }
};


// Get booking by bookingId
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const booking: IBooking | null = await Booking.findById(bookingId).exec();

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        res.status(200).json({ success: true, booking });
    } catch (error) {
        next(error);
    }
};

// Delete booking by bookingId
export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const result = await Booking.findByIdAndDelete(bookingId).exec();

        if (!result) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        res.status(200).json({ success: true, message: 'Booking deleted successfully.' });
    } catch (error) {
        next(error);
    }
};