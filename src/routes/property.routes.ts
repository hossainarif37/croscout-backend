const express = require('express');
import { createProperty, getProperties, getSingleProperty, getPropertiesByUser } from '../controllers/property.controller';

const router = express.Router();

router

    .post('/', createProperty)
    .get('/', getProperties)
    .get('/:id', getSingleProperty)
    .get('/user/:email', getPropertiesByUser)

module.exports = router;