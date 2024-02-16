import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Property from '../models/property.model';
import Transaction from '../models/transaction.model';
import Booking from '../models/booking.model';
import mongoose from 'mongoose';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId; // Assuming the user ID is passed as a route parameter
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (user.role === 'user') {
            return res.status(403).json({ success: false, error: 'Only admins and agents can access this endpoint.' });
        }

        let stats = {};

        if (user.role === 'admin') {
            // Estimated User Count
            const userCount = await User.countDocuments();

            // Total Property Length
            const propertyCount = await Property.countDocuments();

            // Total Revenue
            const totalRevenue = await Transaction.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            // Latest   4 Bookings
            const latestBookings = await Booking.find().sort({ createdAt: -1 }).limit(4);

            stats = {
                userCount,
                propertyCount,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                latestBookings
            };
        } else if (user.role === 'agent') {
            // Total Properties of Agent
            const agentProperties = await Property.countDocuments({ owner: userId });

            // Total Revenue of Agent
            const agentRevenue = await Transaction.aggregate([
                { $match: { agent: new mongoose.Types.ObjectId(userId) } }, // Ensure the agent field is an ObjectId
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            // Total Bookings of Agent
            const agentBookings = await Booking.countDocuments({ owner: userId });


            // Latest   4 Bookings of Agent
            const latestAgentBookings = await Booking.find({ owner: userId }).sort({ createdAt: -1 }).limit(4);


            stats = {
                agentProperties,
                agentRevenue: agentRevenue.length > 0 ? agentRevenue[0].total : 0,
                agentBookings,
                latestAgentBookings
            };
        }

        res.status(200).json({ success: true, stats });
    } catch (error) {
        next(error);
    }
};