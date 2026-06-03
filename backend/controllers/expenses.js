const Expense = require('../models/expense-model')

const createExpense = (async (req, res) => {
    const expense = await Expense.create(req.body)
    res.status(201).json(expense);
})

const getExpenseAll = async (req, res) => {
    
    const {title , category , sort} = req.query;
    const queryObject = {};

    if(title){
        queryObject.title = {$regex : title , $options : 'i'};
    }
    if(category){
        queryObject.category = category
    }
    
    let result = Expense.find(queryObject);

    if(sort){
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    }
    else{
        result = result.sort('-createdAt');
    }
    const expenses = await result;
    res.status(200).json({expenses})
}

const getExpense = async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findById(id)
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
}

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const {title , amount , category} = req.body;
    const queryObject = {}
    if(title !== undefined){
        queryObject.title = title;
    }
    if(amount !== undefined){
        queryObject.amount = amount;
    }
    if(category !== undefined){
        queryObject.category = category;
    }
    const expense = await Expense.findByIdAndUpdate(id, queryObject, { returnDocument: 'after' , runValidators : true });
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
}

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
}

module.exports = {
    createExpense,
    getExpense,
    getExpenseAll,
    updateExpense,
    deleteExpense
}