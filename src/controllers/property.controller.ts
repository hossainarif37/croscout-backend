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
        const filter: { location?: RegExp, guests?: { $gte: number }, propertyType?: RegExp } = {};
        const location = req.query.location;
        const guest = req.query.guest;
        const category = req.query.category;
        if (typeof location === "string") {
            filter.location = new RegExp(location, 'i');
        }
        if (typeof guest === "string") {
            filter.guests = { $gte: parseInt(guest, 10) };
        }
        if (typeof category === "string") {
            filter.propertyType = new RegExp(category, 'i');
        }
        const properties = await Property.find(filter);
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


// Delete Property by ID
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const deletedProperty = await Property.findByIdAndDelete(id);
        if (!deletedProperty) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }
        res.status(200).json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Update Property by ID
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateDocuments = req.body;

        // Check if updateDocuments is empty
        if (Object.keys(updateDocuments).length === 0) {
            return res.status(400).json({ success: false, error: 'No update data provided' });
        }

        const updatedProperty = await Property.findByIdAndUpdate(id, updateDocuments, { new: true });
        if (!updatedProperty) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }
        res.status(200).json({ success: true, message: 'Updated Successfully' });
    } catch (error) {
        next(error);
    }
};