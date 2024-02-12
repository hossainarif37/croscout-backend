import { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking.model';
import Property, { IProperty } from '../models/property.model';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Define the Owner interface
interface IOwner {
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
