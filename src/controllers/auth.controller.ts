import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Agent from '../models/agent.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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
                    role
                });
                await newUser.save();

                if (role === 'agent') {
                    //* Create a new Agent document linked to the new User
                    const newAgent = new Agent({
                        user: newUser._id,
                        taxNumber: taxNumber,
                        name,
                        email,
                        password: hash,
                        role
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