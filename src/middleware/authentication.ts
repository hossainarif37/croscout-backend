import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            // Handle the unauthorized user case here
            return res.status(401).json({ success: false, error: 'Unauthorized access' });
        }

        req.user = user;
        next();
    })(req, res, next);
};

export { checkAuth };