const express = require('express');
import { createProperty, getProperties, getSingleProperty, getPropertiesByUser, updateProperty, deleteProperty } from '../controllers/property.controller';
import { checkSecureUser } from '../middleware/authentication';

const router = express.Router();

router

    // Create a Property
    .post('/', checkSecureUser, createProperty)

    // Get All Properties
    .get('/', getProperties)

    // Get a Single Property by Property ID
    .get('/:id', getSingleProperty)

    // Get Properties by User
    .get('/user/:email', checkSecureUser, getPropertiesByUser)

    // Update Property by ID
    .put('/:id', checkSecureUser, updateProperty)

    // Delete Property by ID
    .delete('/:id', checkSecureUser, deleteProperty)

module.exports = router;