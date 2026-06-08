const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const connectDB = require('./DB/connect')
const app = express();
const expense = require('./routes/expense');
const authRoutes = require('./routes/auth');
require('dotenv').config()

// Initialize offline mode as false by default
app.locals.isOfflineMode = false;

// Security & parsing middleware
app.use(helmet())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1', expense);

const port = process.env.PORT || 3000

const start = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment or .env file');
        }
        await connectDB(process.env.MONGO_URI)
        console.log('Connected to MongoDB database successfully')
        app.listen(port, () => {
            console.log(`Server is Listening on port ${port}...`)
        })
    }
    catch (err) {
        console.error('Database connection failed:', err.message)
        console.log('Starting server in offline-mode fallback...')
        app.locals.isOfflineMode = true; // Enable in-memory fallback
        app.listen(port, () => {
            console.log(`Server is Listening on port ${port} (OFFLINE-MODE)...`)
        })
    }
}

start()
