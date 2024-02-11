
import express from 'express';
import { addToFavorites, getFavorites } from '../controllers/favorite.controller';

const router = express.Router();

router

    // Add Property to Favorite List
    .post('/:userId', addToFavorites)

    // Get Favorite Properties by UserId
    .get('/:userId', getFavorites)

module.exports = router;