const express = require('express')
const app = express();
const connectDB = require('./DB/connect')
require('dotenv').config()

const port = process.env.PORT

try{
    connectDB(process.env.MONGO_URI)
    app.listen(3000 , ()=>{
        console.log('Server is Listening ...')
    })
}
catch(err){
    console.log(err)
}
