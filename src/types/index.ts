import { Request } from 'express';
import mongoose from 'mongoose';

export interface RequestWithUser extends Request {
    user: {
        name: string;
        email: string;
        password: string;
        role: 'user' | 'agent';
        agentId?: mongoose.Types.ObjectId;
        favoriteList?: mongoose.Types.ObjectId;
        resetPasswordToken?: string;
        resetPasswordExpires?: Date;
        _id: any;
    };
}