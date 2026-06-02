const express = require('express')
const app = express();
const connectDB = require('./DB/connect')
const expense = require('./routes/expense');
require('dotenv').config()
app.use(express.json())

//middleware
app.use('/api/v1', expense);

const port = process.env.PORT

try {
    connectDB(process.env.MONGO_URI)
    app.listen(3000, () => {
        console.log('Server is Listening ...')
    })
}
catch (err) {
    console.log(err)
}
