import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';


const router = express.Router()

router

    .get('/stats/:userId', getDashboardStats)



module.exports = router;