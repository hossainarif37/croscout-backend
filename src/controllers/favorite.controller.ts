import { Request, Response, NextFunction } from 'express';

import FavoriteList from '../models/favorite.model';
import User from '../models/user.model';

export const addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { propertyId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.role === "agent") {
            return res.status(403).json({ success: false, error: 'Forbidden access' });
        }

        const favoriteList = await FavoriteList.findOne({ user: userId });
        if (!favoriteList) {
            // If favoriteList doesn't exist, create a new one
            const newFavoriteList = new FavoriteList({ user: userId, properties: [propertyId] });
            await newFavoriteList.save();
            user.favoriteList = newFavoriteList._id;
            await user.save();
            return res.status(201).json({ success: true, message: 'Property added to favorites' });
        } else {
            // Check if the property is already in the favoriteList
            if (favoriteList.properties.includes(propertyId)) {
                return res.status(200).json({ success: true, message: 'Property already in favorites' });
            } else {
                // Add the property to the favoriteList
                favoriteList.properties.push(propertyId);
                await favoriteList.save();
                return res.status(200).json({ success: true, message: 'Property added to favorites' });
            }
        }
    } catch (error) {
        next(error);
    }
};



export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;


        const user = await User.findById(userId).populate('favoriteList');
        if (!user || !user.favoriteList) {
            return res.status(404).json({ success: false, error: 'User or favorite list not found' });
        }

        const favoriteList = await FavoriteList.findById(user.favoriteList).populate('properties', '-bookedDates');
        if (!favoriteList) {
            return res.status(404).json({ success: false, error: 'Favorite list not found' });
        }
        res.status(200).json({ success: true, favorites: favoriteList.properties });
    } catch (error) {
        next(error);
    }
};

export const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId; // Assuming userId is passed as a route parameter
        const { propertyId } = req.body;

        // Find the favorite list for the given user
        const favoriteList = await FavoriteList.findOne({ user: userId });

        if (!favoriteList) {
            return res.status(404).json({ success: false, message: 'Favorite list not found' });
        }

        // Remove the property from the favorite list
        favoriteList.properties = favoriteList.properties.filter(prop => prop.toString() !== propertyId);
        await favoriteList.save();

        res.status(200).json({ success: true, message: 'Favorite deleted successfully' });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ success: false, message: 'Failed to delete favorite' });
    }
};

export const checkFavoriteProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { property_id } = req.query;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Retrieve the user's favorite list
        const favoriteList = await FavoriteList.findOne({ user: userId }).populate('properties');
        if (!favoriteList) {
            return res.status(404).json({ success: false, error: 'Favorite list not found' });
        }

        // Check if the property is in the favorite list
        const isInFavorites = favoriteList.properties.some(prop => prop._id.toString() === property_id);

        // Respond with the result
        return res.status(200).json({ success: true, isInFavorites });
    } catch (error) {
        next(error);
    }
};