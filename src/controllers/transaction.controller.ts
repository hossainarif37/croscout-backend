import { NextFunction, Request, Response } from 'express';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';

// Admin can get all transactions
export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await Transaction.find();
        res.json({ success: true, transactions });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

// Agent can get only their booking transactions
export const getTransactionsByRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found.' });
        }

        if (user?.role === 'user') {
            const transactions = await Transaction.find({ user: userId });
            if (transactions.length > 0) {
                res.status(200).json({ success: true, transactions })
            } else {
                res.status(404).json({ success: false, error: 'No transactions found.' });
            }
        }
        else if (user?.role === 'agent') {
            const transactions = await Transaction.find({ agent: userId });
            if (transactions.length > 0) {
                res.status(200).json({ success: true, transactions })
            } else {
                res.status(404).json({ success: false, error: 'No transactions found.' });
            }
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
};