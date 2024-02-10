import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { config as dotenvConfig } from 'dotenv';
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');

// Load environment variables from .env file
dotenvConfig();

// Load Database and Passport configuration
import "./config/database"
import "./config/passport"

const app = express();

app.use(express.json());
// app.use(cors());

app.use(cors({
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, "http://localhost:3000"] : "http://localhost:3000" || '*'
}));


// Configure express-session middleware
app.use(session({
    secret: process.env.JWT_SECRET_KEY || 'fallbackSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you are using HTTPS
}));

app.use(express.urlencoded({ extended: true }));

// Passport and Session Initialize
app.use(passport.initialize());

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to Airbnb server');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/properties', propertyRoutes);

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

//* server error
import errorHandler from './errorHandlers/errorHandler';
app.use(errorHandler);


export default app;

