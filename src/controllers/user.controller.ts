import { Request, Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/user.model';
import { RequestWithUser } from '../types';

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const getUserDataById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId; // Extract userId from the request parameters

        // Find the user by the provided userId and exclude the password field
        const user: UserDocument | null = await User.findById(userId, '-password').exec();

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// Controller method for getting all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users: UserDocument[] = await User.find().exec();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// Controller method for deleting a user
export const deleteUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const loggedInUserId = req.user._id; // Assuming req.user is populated with the authenticated user

        if (userId !== loggedInUserId.toString()) {
            return res.status(403).json({ success: false, error: 'You can only delete your own account.' });
        }

        const result = await User.findByIdAndDelete(userId).exec();

        if (!result) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};