const Expense = require('../models/expense-model')

const createExpense = (async (req, res) => {
    const expense = await Expense.create(req.body)
    res.status(200).json(expense);
})

const getExpenseAll = async (req, res) => {
    const expense = await Expense.find({}).sort(req.query.sort)
    res.status(200).json(expense)
}

const getExpense = async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findById(id).sort(req.query.sort)
    if (!expense) {
        res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
    res.status(404).json({ msg: err });
}

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    if (!expense) {
        res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
}

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
        res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    res.status(200).json(expense);
}

const getExpenseFiltered = async (req,res) =>{
    const expense = await Expense.find(req.body).sort(req.query.sort)
    res.status(200).json(expense);
}

module.exports = {
    createExpense,
    getExpense,
    getExpenseFiltered,
    getExpenseAll,
    updateExpense,
    deleteExpense
}