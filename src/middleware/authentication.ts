// import { Response, NextFunction } from 'express';
// const jwt = require('jsonwebtoken');
// import User, { UserDocument } from '../models/user.model';
import passport from 'passport';
import { RequestWithUser } from '../types';
import { Request, Response, NextFunction } from 'express';


const checkAuth = (req: RequestWithUser, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            // Handle the unauthorized user case here
            return res.status(401).json({ success: false, error: 'Unauthorized access' });
        }

        req.user = user;
        next();
    })(req, res, next);
};

// const checkAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     const token = req.cookies?.token;
//     const secret = process.env.JWT_SECRET_KEY;
//     if (!token) {
//         return res.status(401).send({ message: "unauthorized access" })
//     }
//     if (!secret) {
//         return res.status(401).send({ message: "unauthorized access" })
//     }
//     jwt.verify(token, secret, async (err: Error, decoded: any) => {
//         if (err) {
//             return res.status(403).send({ message: "unauthorized access" })
//         }
//         const currentUser: UserDocument | null = await User.findOne({ _id: decoded.id });
//         if (currentUser) {
//             req.user = {
//                 name: currentUser.name,
//                 _id: currentUser._id,
//                 email: currentUser.email,
//                 password: currentUser.password,
//                 role: currentUser.role,
//             };
//             next();
//         } else {
//             return res.status(404).send({ message: "User not found" });
//         }
//     })
// }

export { checkAuth };