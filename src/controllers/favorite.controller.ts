import { Request, Response, NextFunction } from 'express';

import FavoriteList from '../models/favorite.model';
import User from '../models/user.model';

export const addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { propertyId } = req.body;

        const user = await User.findById(userId);

        console.log(13, user);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.role === "agent" || user.role === "admin") {
            return res.status(403).json({ success: false, error: 'Forbidden access' });
        }

        // Check if the propertyId is already in the user's favoriteList
        if (user.favoriteList && user.favoriteList.includes(propertyId)) {

            // Remove the property from the favorite list
            user.favoriteList = user.favoriteList!.filter(prop => prop.toString() !== propertyId);

            await user.save();
            return res.status(200).json({ success: true, isAdd: false, message: 'Removed the property from the favorite list' });
        } else {
            if (!user.favoriteList) {
                user.favoriteList = [propertyId];

            } else {
                // Add the propertyId to the user's favoriteList
                user.favoriteList.push(propertyId);

            }

            await user.save();
            return res.status(200).json({ success: true, isAdd: true, message: 'Added the property to the favorite list' });
        }

    } catch (error) {
        next(error);
    }
};


export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;


        const user = await User.findById(userId).populate('favoriteList', '-bookedDates');
        if (!user || !user.favoriteList) {
            return res.status(404).json({ success: false, error: 'User or favorite list not found' });
        }


        res.status(200).json({ success: true, favoritList: user.favoriteList });
    } catch (error) {
        next(error);
    }
};

export const deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId; // Assuming userId is passed as a route parameter
        const { propertyId } = req.body;


        // Find the favorite list for the given user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.favoriteList?.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found in the favorite list in the user' });
        } else {
            // Remove the property from the favorite list
            user.favoriteList = user.favoriteList!.filter(prop => prop.toString() !== propertyId);
        }

        await user.save();

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

        console.log('Hit checkFavoriteProperty');

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