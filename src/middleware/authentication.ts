// import { Response, NextFunction } from 'express';
// const jwt = require('jsonwebtoken');
// import User, { UserDocument } from '../models/user.model';
import passport from 'passport';
import { RequestWithUser } from '../types';
import { Request, Response, NextFunction } from 'express';
import { UserDocument } from '../models/user.model';


// Middleware to check if the requested user is secure
const checkSecureUser = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: UserDocument | false, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }

        // If the user is secure, you can continue to the next middleware
        // For example, you can set the user on the request object for later use
        req.user = user;
        next();
    })(req, res, next);
};

export { checkSecureUser };