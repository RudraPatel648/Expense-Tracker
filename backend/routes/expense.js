const route = require('express').Router();
const { createExpense, getExpense , getExpenseFiltered, getExpenseAll, updateExpense, deleteExpense , } = require('../controllers/expenses')
const asyncWrapper = require('../middleware/async')


route.post('/expenses', asyncWrapper(createExpense))

route.get('/expenses/:id', asyncWrapper(getExpense))

//Shouldn't Use Post , But cant write query paramas in url everytime 🙏
route.post('/expenses/filter' , asyncWrapper(getExpenseFiltered)) 

route.get('/expenses', asyncWrapper(getExpenseAll))

route.patch('/expenses/:id', asyncWrapper(updateExpense))

route.delete('/expenses/:id', asyncWrapper(deleteExpense))


module.exports = route