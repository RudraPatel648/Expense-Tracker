const Expense = require('../models/expense-model')

// In-memory array fallback
let localExpenses = [];

const createExpense = async (req, res) => {
    if (req.app.locals.isOfflineMode) {
        const newExpense = {
            _id: new Date().getTime().toString(),
            userId: req.userId,
            title: req.body.title,
            amount: Number(req.body.amount),
            category: req.body.category,
            createdAt: new Date().toISOString()
        };
        localExpenses.push(newExpense);
        return res.status(201).json(newExpense);
    }
    const expense = await Expense.create({ ...req.body, userId: req.userId })
    return res.status(201).json(expense);
}

const getExpenseAll = async (req, res) => {
    if (req.app.locals.isOfflineMode) {
        const { title, category, sort } = req.query;
        let filtered = localExpenses.filter(e => e.userId === req.userId);

        if (title) {
            filtered = filtered.filter(e => e.title.toLowerCase().includes(title.toLowerCase()));
        }
        if (category) {
            filtered = filtered.filter(e => e.category === category);
        }

        // Apply sorting
        if (sort) {
            const isDesc = sort.startsWith('-');
            const sortField = isDesc ? sort.slice(1) : sort;
            filtered.sort((a, b) => {
                let valA = a[sortField];
                let valB = b[sortField];
                
                if (sortField === 'createdAt') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }
                
                if (valA < valB) return isDesc ? 1 : -1;
                if (valA > valB) return isDesc ? -1 : 1;
                return 0;
            });
        } else {
            // Default sort: newest first
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return res.status(200).json({ expenses: filtered });
    }

    const {title , category , sort} = req.query;
    const queryObject = { userId: req.userId };

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
    return res.status(200).json({expenses})
}

const getExpense = async (req, res) => {
    const { id } = req.params;
    if (req.app.locals.isOfflineMode) {
        const expense = localExpenses.find(e => e._id === id && e.userId === req.userId);
        if (!expense) {
            return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
        }
        return res.status(200).json(expense);
    }

    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    return res.status(200).json(expense);
}

const updateExpense = async (req, res) => {
    const { id } = req.params;
    if (req.app.locals.isOfflineMode) {
        const index = localExpenses.findIndex(e => e._id === id && e.userId === req.userId);
        if (index === -1) {
            return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
        }
        const { title, amount, category } = req.body;
        if (title !== undefined) localExpenses[index].title = title;
        if (amount !== undefined) localExpenses[index].amount = Number(amount);
        if (category !== undefined) localExpenses[index].category = category;
        return res.status(200).json(localExpenses[index]);
    }

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
    const expense = await Expense.findOneAndUpdate(
        { _id: id, userId: req.userId },
        queryObject,
        { returnDocument: 'after', runValidators: true }
    );
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    return res.status(200).json(expense);
}

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    if (req.app.locals.isOfflineMode) {
        const index = localExpenses.findIndex(e => e._id === id && e.userId === req.userId);
        if (index === -1) {
            return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
        }
        const deleted = localExpenses.splice(index, 1);
        return res.status(200).json(deleted[0]);
    }

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    if (!expense) {
        return res.status(404).json({ msg: `No Expenses with Id : ${id}` })
    }
    return res.status(200).json(expense);
}

module.exports = {
    createExpense,
    getExpense,
    getExpenseAll,
    updateExpense,
    deleteExpense
}