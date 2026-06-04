const express = require('express')
const cors = require('cors')
const connectDB = require('./DB/connect')
const app = express();
const expense = require('./routes/expense');
require('dotenv').config()

// Initialize offline mode as false by default
app.locals.isOfflineMode = false;

app.use(cors())
app.use(express.json())
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
