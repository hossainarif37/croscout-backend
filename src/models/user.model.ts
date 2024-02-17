import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'agent' | 'admin';
    taxNumber: string;
    isCompletedProfile: boolean;
    isAdmin: boolean;
    telephoneOrPhone?: string;
    street?: string;
    houseOrBuildingNum?: string;
    postcode?: string;
    city?: string;
    state?: string;
    image?: string;
    favoriteList?: mongoose.Types.ObjectId[]; // Array of ObjectId references
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}



const userSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'agent', 'admin'], required: true, default: 'user' },
    taxNumber: { type: String },
    isCompletedProfile: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    telephoneOrPhone: { type: String },
    street: { type: String },
    houseOrBuildingNum: { type: String },
    postcode: { type: String },
    city: { type: String },
    state: { type: String },
    image: { type: String },
    favoriteList: [{ type: Schema.Types.ObjectId, ref: 'Property' }], // Array of ObjectId references to Property model
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<UserDocument>('User', userSchema);
