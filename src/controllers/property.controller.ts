import { Request, Response, NextFunction } from 'express';
import Property from '../models/property.model';
import User from '../models/user.model';

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const property = new Property(req.body);
        console.log(property);
        await property.save();


        res.status(201).json({ success: true, message: "Property Created Successfully" });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const properties = await Property.find({});
        res.status(200).json({ success: true, properties });
    } catch (error) {
        next(error);
    }
};

export const getSingleProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id).populate('owner', '-email -password -role');
        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }
        res.status(200).json({ success: true, property });
    } catch (error) {
        next(error);
    }
};

export const getPropertiesByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const properties = await Property.find({ owner: user._id }).populate('owner');
        res.status(200).json({ success: true, properties });
    } catch (error) {
        next(error);
    }
};