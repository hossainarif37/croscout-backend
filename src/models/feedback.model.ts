import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    property: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}

const FeedbackSchema: Schema = new Schema({
    property: { type: mongoose.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String }
});

const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;