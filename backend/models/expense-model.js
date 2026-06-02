const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Must provide name']
        },
        amount:{
            type:Number,
            required: [true , 'Must provide amount']
        },
        category:{
            type:String,
            required:[true,'Must define category']
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }
    }
);

const Expense = mongoose.model('expense' , expenseSchema);

module.exports = Expense