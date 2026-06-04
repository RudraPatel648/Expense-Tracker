const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            maxLength : [20 , 'Maximum length of title is 20'],
            required: [true, 'Must provide name']
        },
        amount:{
            type:Number,
            min:[10 , 'Minimum amount that can be tracked is 10'],
            required: [true , 'Must provide amount']
        },
        category:{
            type:String,
            enum: {
                values: ["Food" , "Transport" , "Shopping" , "Bills" , "Entertainment" , "Other"],
                message: 'Category {VALUE} is Invalid'
            },
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