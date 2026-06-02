const route = require('express').Router();
const { createExpense, getExpense, getExpenseAll, updateExpense, deleteExpense } = require('../controllers/expenses')


route.post('/expenses', createExpense)

route.get('/expenses/:id', getExpense)

route.get('/expenses', getExpenseAll)

route.patch('/expenses/:id', updateExpense)

route.delete('/expenses/:id', deleteExpense)


module.exports = route