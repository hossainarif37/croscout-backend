import { Request, Response, NextFunction } from 'express';

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