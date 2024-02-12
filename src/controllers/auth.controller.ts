import { Request, Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/user.model';
import Agent from '../models/agent.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';


dotenv.config();
const saltRounds = 10;

//* User Registration Controller  
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name, role, taxNumber } = req.body;
        const userExist = await User.findOne({ email });
        //* Check user is already exist or not in the database
        if (userExist) {
            return res.status(409).json({
                success: false,
                error: 'Email already exist. Please use a different email or log in'
            });
        }
        //* hash user password
        bcrypt.hash(password, saltRounds, async (err: Error | null, hash: string) => {
            try {
                if (role === 'agent' && !taxNumber) {
                    //* If the user wants to be an agent but did not provide a taxNumber, return an error
                    return res.status(400).json({
                        success: false,
                        error: 'Tax number is required for agents.'
                    });
                }

                //* Create a new User document
                const newUser = new User({
                    name,
                    email,
                    password: hash,
                    role,

                });
                await newUser.save();

                if (role === 'agent') {
                    //* Create a new Agent document linked to the new User
                    const newAgent = new Agent({
                        user: newUser._id,
                        taxNumber: taxNumber
                    });
                    await newAgent.save();
                }

                return res.status(201).json({
                    success: true,
                    message: 'User registered successfully.'
                });
            } catch (error) {
                next(error);
            }
        });
    } catch (error) {
        next(error);
    }
};

//* User Login Controller  
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        //* Validate that 'email' and 'password' fields are present in the request body
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email or Password is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, error: 'User not found' });
        }

        const payload = {
            id: user._id,
            email: user.email
        };

        bcrypt.compare(password, user.password, (err: Error | null, result: boolean) => {
            if (result) {
                //* Generate jwt token
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: '1d' });
                res.status(200).send({
                    success: true,
                    message: "Login in successfully",
                    token: `Bearer ${token}`,
                    user
                });
            } else {
                res.status(401).send({ success: false, error: 'Wrong password' });
            }
        });
    } catch (error) {
        next(error);
    }
};

//* User Logout
export const logOutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.logout((err: Error | null) => {
            if (err) {
                return next(err);
            }
            res.send({ isLogout: true });
        });
    } catch (error) {
        next(error);
    }
};



const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_ID
    }
});

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, clientUrl } = req.body;

        const user: UserDocument | null = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set');
        }
        const resetToken = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const gmailUser = process.env.GMAIL_USER;
        if (!gmailUser) {
            throw new Error('GMAIL_USER is not set');
        }

        const mailOptions = {
            from: {
                name: "Croscout",
                address: gmailUser
            },
            to: user.email,
            subject: 'Password Reset',
            html: `You are receiving this because you have requested the reset of the password for your account.<br/>
            Please click on the following link, or paste this into your browser to complete the process:<br/>
            <a href="${clientUrl}/reset-password/${resetToken}">Click here to reset your password</a><br/>
            If you did not request this, please ignore this email and your password will remain unchanged.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success: false, error: 'Failed to send reset email' });
            }
            res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
        });
    } catch (error) {
        console.log("180 number line: ", error);
        next(error);
    }
};


export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error('JWT_SECRET_KEY is not set');
        }
        const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
        console.log(decoded);
        const userId = decoded.id;

        // Find user by id
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if reset token is valid
        if (token !== user.resetPasswordToken) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token. Resend again' });
        }

        // Check if token has expired
        if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ success: false, error: 'Token has expired. Resend again' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Line no 226 - Error in resetPassword: ', error);
        next(error)
    }
};