import mongoose, { Schema, Document } from 'mongoose';

interface IProperty extends Document {
    name: string;
    description: string;
    amenities: string[];
    pricePerNight: number;
    location: string;
    state: string;
    propertyType: string;
    owner: mongoose.Types.ObjectId; // Agent ID
    bookedDates: Date[];
    guests: number;
    propertyImages: string[];
    ratings: number[];
}

const PropertySchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String, required: true }],
    pricePerNight: { type: Number, required: true },
    location: { type: String, required: true },
    state: { type: String, required: true },
    propertyType: { type: String, required: true },
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    bookedDates: [{ type: Date }],
    guests: { type: Number, required: true },
    propertyImages: [{ type: String, required: true }],
    ratings: [{ type: Number, required: true }]
});

const Property = mongoose.model<IProperty>('Property', PropertySchema);
export default Property;
