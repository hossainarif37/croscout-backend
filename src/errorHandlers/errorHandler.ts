import { Request, Response, NextFunction } from 'express';
import { MongooseError } from 'mongoose';

const errorHandler = (err: MongooseError, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, error: err.message });
    } else if (err.name === 'CastError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({
        success: false,
        error: 'Internal server error!'
    });
};

export default errorHandler;