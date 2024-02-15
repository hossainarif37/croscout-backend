import { Request, Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/user.model';
import { RequestWithUser } from '../types';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
const saltRounds = 10;

interface ICommonProperties {
    image: string;
    name: string;
    taxNumber: string;
    role: string;
}

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

export const getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.query;

        // Find the users by the provided role
        const users: UserDocument[] = await User.find({ role }).exec();
        res.status(200).json({ success: true, users });

    } catch (error) {
        console.log(error);
        next(error);
    }
}


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
        const loggedInUserId = req.user._id;

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

// Controller method for updating a user
// Define routes
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const body = req?.body?.update;
        const role = body?.role;

        const commonProperties: Partial<ICommonProperties> = {
            name: body?.name,
            image: body?.image
        };

        if (role === "agent") {
            commonProperties.role = "agent";
            commonProperties.taxNumber = body?.taxNumber;
        }

        const updatedDoc = {
            $set: commonProperties
        };

        const user = await User.findByIdAndUpdate(userId, updatedDoc, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).send({ success: true, message: "User Info Update" });
    } catch (error) {
        console.error('Error updating user:', error);
        next(error);
    }
};


export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const { oldPassword, newPassword } = req.body.update;
        // Use await to wait for the user to be fetched
        const user: any = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Compare the passwords
        bcrypt.compare(oldPassword, user.password, async (err: Error | null, result: boolean) => {
            if (err) {
                // Handle the error
                return res.status(500).json({ success: false, error: err.message });
            }
            if (result) {
                bcrypt.hash(newPassword, saltRounds, async (err: Error | null, hash: string) => {
                    try {
                        const userIdObjectId = new mongoose.Types.ObjectId(userId);
                        const updatedDoc = {
                            $set: {
                                password: hash
                            }
                        }
                        const response = await User.updateOne({ _id: userIdObjectId }, updatedDoc);
                        res.send({ success: true, message: "Password Changed", data: response })

                    } catch (error: any) {
                        res.send({ success: false, message: error.message })
                        next(error);
                    }
                });
            } else {
                res.status(401).send({ success: false, error: 'Wrong password' });
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        next(error);
    }
};