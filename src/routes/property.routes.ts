const express = require('express');
import { createProperty, getProperties, getSingleProperty, getPropertiesByUser, updateProperty, deleteProperty } from '../controllers/property.controller';

const router = express.Router();

router

    // Create a Property
    .post('/', createProperty)

    // Get All Properties
    .get('/', getProperties)

    // Get a Single Property by Property ID
    .get('/:id', getSingleProperty)

    // Get Properties by User
    .get('/user/:email', getPropertiesByUser)

    // Update Property by ID
    .put('/:id', updateProperty)

    // Delete Property by ID
    .delete('/:id', deleteProperty)

module.exports = router;