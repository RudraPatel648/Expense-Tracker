const Expense = require('../models/expense-model');

const createExpense = async (req, res) => {
    try {
        const expense = await Expense.create(req.body)
        res.status(200).json(expense);

    }
    catch (err) {
        res.status(404).json({ msg: err })
    }
}

const getExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await Expense.findById(id);
        res.status(200).json(expense);
    }
    catch (err) {
        res.status(404).json({ msg: err });
    }
}

const getExpenseAll = async (req, res) => {
    const expenses = await Expense.find({});
    res.status(200).json(expenses)
}

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
        res.status(200).json(expense);
    }
    catch (err) {
        res.status(404).json({ msg: err });
    }
}

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await Expense.findByIdAndDelete(id);
        res.status(200).json(expense);
    }
    catch (err) {
        res.status(404).json({ msg: err });
    }
}

module.exports = {
    createExpense,
    getExpense,
    getExpenseAll,
    updateExpense,
    deleteExpense
}