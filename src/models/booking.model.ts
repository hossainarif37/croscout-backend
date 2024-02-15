import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    guest: mongoose.Types.ObjectId;
    property: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    price: string;
    totalGuests: string;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    paymentInfo: {
        paymentEmail?: string;
        paymentInstruction?: string;
    }
    transactionId: string;
}

const BookingSchema: Schema = new Schema({
    guest: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    price: { type: String, required: true },
    totalGuests: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    payementInfo: {
        paymentEmail: { type: String },
        paymentInstruction: { type: String }
    },
    transactionId: { type: String },
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
