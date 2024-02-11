const express = require('express');
import { createProperty, getProperties, getSingleProperty, getPropertiesByUser } from '../controllers/property.controller';

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

module.exports = router;