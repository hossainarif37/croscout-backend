import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { config as dotenvConfig } from 'dotenv';
const authRoutes = require('./routes/auth.routes');

// Load environment variables from .env file
dotenvConfig();

import "./config/database"
// Load Passport configuration
import "./config/passport"

const app = express();

app.use(express.json());
app.use(cors());

// app.use(cors({
//     origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, "http://localhost:3000"] : "http://localhost:3000" || '*'
// }));
app.use(express.urlencoded({ extended: true }));

// Passport and Session Initialize
app.use(passport.initialize());

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to Airbnb server');
});

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);

// Route not found
app.use((req, res, next) => {
    res.status(404).json({ message: 'route not found' });
});

// Server error
// import errorHandler from './errorHandlers/errorHandler';
// app.use(errorHandler);

// Start the server
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


export default app;

