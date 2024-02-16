import { Request, Response, NextFunction } from 'express';
import Booking, { IBooking } from '../models/booking.model';
import User, { UserDocument } from '../models/user.model';
import Property, { IProperty } from '../models/property.model';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import Transaction from '../models/transaction.model';

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
        const { guestId, totalGuests, ownerId, propertyId, price, startDate, endDate } = req.body;


        // Find the property and cast the owner to the IOwner interface
        const property = await Property.findById(propertyId)
            .populate('owner') as IProperty & { owner: IOwner };

        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        };

        // Check if the property is already booked for the same dates
        const existingBooking = await Booking.findOne({
            property: propertyId,
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
            guest: guestId,
            owner: ownerId,
            price,
            totalGuests,
            property: propertyId,
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

        if (property && property.owner) {
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
        }

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
        const booking = await Booking.findById(bookingId).populate('guest') as IBooking & { guest: IGuest };

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }
        const properties = await Property.findById(booking.property);

        let message = '';
        if (action === 'confirm') {
            if (booking.status === 'confirmed') {
                return res.json({ success: false, error: "Already confirmed this booking" })
            }
            booking.status = 'confirmed';
            message = 'Your booking has been confirmed.';

            // Create a new transaction when the booking is confirmed
            const transaction = new Transaction({
                booking: booking._id,
                user: booking.guest._id,
                agent: booking.owner,
                amount: parseFloat(booking.price),
                transactionId: booking.userTransactionId,
                paymentMethod: 'Paypal',
            });

            if (!booking.agentPaypalEmail) {
                return res.json({ success: false, error: "You haven't sent a Payment Request with Payment Details to the user. Please send the payment request before updating the status." });
            }

            if (!booking.userTransactionId) {
                return res.json({ success: false, error: "Transaction ID has not been received yet. Please wait until the Transaction ID is received before updating the status." });
            }
            // Save the transaction to the database
            await transaction.save();


        } else if (action === 'cancel') {
            // Remove the booking's startDate and endDate from the property's bookedDates
            if (booking.status === 'confirmed') {
                return res.json({ success: false, error: "This booking has already been confirmed. Cancellation is not allowed at this stage." })
            }
            if (properties?.bookedDates) {
                properties.bookedDates = properties.bookedDates.filter(date =>
                    !(date.startDate.getTime() === booking.startDate.getTime() && date.endDate.getTime() === booking.endDate.getTime())
                );
            }
            booking.status = 'cancelled';
            message = 'Your booking has been cancelled.';
        } else {
            return res.status(400).json({ success: false, error: 'Invalid action.' });
        }

        await booking.save({ validateBeforeSave: false });
        await properties?.save();

        const gmailUser = process.env.GMAIL_USER;
        if (!gmailUser) {
            throw new Error('GMAIL_USER is not set');
        }

        // Send email to the guest
        if (booking.guest) {
            const mailOptions = {
                from: {
                    name: "Croscout",
                    address: gmailUser
                },
                to: booking.guest.email, // Assuming the guest has an email field
                subject: `Booking Status Update: ${booking.status}`,
                text: `Hello ${booking.guest.name}, your booking has been ${booking.status}.`,
                html: `<b>Hello ${booking.guest.name},</b><br><p>Your booking has been ${booking.status}.</p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log(`Email sent: ${info.response}`);
                }
            });
        }

        if (booking.status === 'cancelled') {
            await Booking.deleteOne({ _id: booking._id });
        }
        return res.json({ success: true, message });

    } catch (error) {
        console.error(error);
        next(error);
    }
};



// Get All Bookings
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookings: IBooking[] = await Booking.find().populate('guest', 'name -_id').populate('owner', 'name -_id');
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        next(error);
    }
};


// Get booking by bookingId
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const booking: IBooking | null = await Booking.findById(bookingId)
            .populate('guest', '-password')
            .populate('property', '-bookedDates')
            .populate('owner', '-password')

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }


        res.status(200).json({ success: true, booking });
    } catch (error) {
        next(error);
    }
};

// Controller method for guests to get their bookings
export const getBookingsByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId; // Get the userId from the route parameter
        // Find the user by the provided userId
        const user: UserDocument | null = await User.findById(userId).exec();



        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        let bookings: IBooking[] = [];

        // Check the user's role and retrieve bookings accordingly
        console.log(229, user.role);
        if (user.role === 'user') {
            bookings = await Booking.find({ guest: userId })
                .populate('guest', 'name -_id');

            // If the user is a guest, retrieve their bookings
        } else if (user.role === 'agent') {
            // If the user is an agent, retrieve all bookings for their properties
            bookings = await Booking.find({ owner: userId })
                .populate('guest', 'name -_id')
        }

        // Check if bookings array is empty and send an appropriate response
        if (bookings.length === 0) {
            return res.status(404).json({ success: false, error: 'No bookings found' });
        }

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.log('Error checking', error);
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


export const updatePaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const { agentPaypalEmail, paymentInstruction } = req.body;

        // Find the booking by ID
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        // Check if agentPaypalEmail or paymentInstruction already exist
        if (booking.agentPaypalEmail || booking.paymentInstruction) {
            return res.status(400).json({ success: false, error: 'Payment details already exist.' });
        }

        // Update the booking with new payment details
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
            agentPaypalEmail,
            paymentInstruction,
        }, { new: true });

        // TODO: Send email notification to user with payment details

        res.json({ success: true, message: 'Payment details updated', booking: updatedBooking });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const submitTransactionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = req.params;
        const { userTransactionId } = req.body;

        // Find the booking by ID
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found.' });
        }

        // Check if userTransactionId already exists
        if (booking.userTransactionId) {
            return res.status(400).json({ success: false, error: 'Transaction ID already exists.' });
        }

        // Update the booking with the new transaction ID
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
            userTransactionId,
        }, { new: true });

        // TODO: Send email notification to agent with transaction ID

        res.json({ success: true, message: "Transaction ID updated successfully", booking: updatedBooking });
    } catch (error) {
        console.log(error);
        next(error);
    }
};