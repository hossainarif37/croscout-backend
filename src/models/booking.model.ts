import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    guest: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    price: string;
    startDate: Date;
    endDate: Date;
    status: string; // Booking status (e.g., confirmed, rejected, cancelled)
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
    guest: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    price: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
