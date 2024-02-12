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
            const newFavoriteList = new FavoriteList({ user: userId, properties: [propertyId] });
            await newFavoriteList.save();
            user.favoriteList = newFavoriteList._id;
            await user.save();
            return res.status(201).json({ success: true, message: 'Property added to favorites' });
        } else {
            favoriteList.properties.push(propertyId);
            await favoriteList.save();
            return res.status(200).json({ success: true, message: 'Property added to favorites' });
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

        const favoriteList = await FavoriteList.findById(user.favoriteList).populate('properties');
        if (!favoriteList) {
            return res.status(404).json({ success: false, error: 'Favorite list not found' });
        }
        res.status(200).json({ success: true, favorites: favoriteList.properties });
    } catch (error) {
        next(error);
    }
};