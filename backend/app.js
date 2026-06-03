const express = require('express')
const connectDB = require('./DB/connect')
const app = express();
const expense = require('./routes/expense');
require('dotenv').config()

app.use(express.json())
app.use('/api/v1', expense);

const port = process.env.PORT || 3000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () => {
            console.log('Server is Listening ...')
        })
    }
    catch (err) {
        console.log(err)
    }
}

start();