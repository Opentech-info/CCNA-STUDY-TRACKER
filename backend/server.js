require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env file

// --- Data Caching ---
// Read commands.json once at startup to avoid reading from disk on every request.
let commandsData = {};
try {
    const commandsPath = path.join(__dirname, '..', 'frontend', 'commands.json');
    const rawData = fs.readFileSync(commandsPath, 'utf8');
    commandsData = JSON.parse(rawData);
    console.log('✅ Commands data loaded and cached successfully.');
} catch (err) {
    console.error('❌ Failed to load commands.json:', err);
    // Exit if the core data can't be loaded.
    process.exit(1);
}

// --- Middleware ---

// Security: Set various HTTP headers for security
app.use(helmet());

// CORS: Only allow requests from your frontend URL in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
};
app.use(cors(corsOptions));

// Logging: Log HTTP requests in a developer-friendly format
app.use(morgan('dev'));

// Rate Limiting: Protect against brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter); // Apply to all API routes

app.use(express.json()); // To parse JSON bodies in POST/PUT requests

// --- API Routes ---

// API endpoint to serve the commands data
app.get('/api/commands', (req, res) => {
    // Serve the cached data
    res.status(200).json(commandsData);
});

// API endpoint to handle new subscribers
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const subscriberData = `${new Date().toISOString()} - ${email}\n`;
    const subscribersFilePath = path.join(__dirname, 'subscribers.txt');

    fs.appendFile(subscribersFilePath, subscriberData, (err) => {
        if (err) {
            console.error('Error saving subscriber:', err);
            return res.status(500).json({ message: 'Could not subscribe at this time. Please try again later.' });
        }
        console.log(`New subscriber: ${email}`);
        res.status(200).json({ message: 'Thank you for subscribing!' });
    });
});

// Catch-all for any other /api routes that are not found
app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
});

// --- Serve Frontend ---
// This serves all the static files (HTML, CSS, JS) from the 'frontend' directory
// It will also automatically serve index.html for the root '/' route.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
    console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});