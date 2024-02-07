// src/models/Agent.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface AgentDocument extends Document {
    user: mongoose.Types.ObjectId;
    taxNumber: string;
}

const agentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taxNumber: { type: String, required: true },
});

export default mongoose.model<AgentDocument>('Agent', agentSchema);
