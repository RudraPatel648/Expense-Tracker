const router = require('express').Router();
const { createExpense, getExpense , getExpenseAll, updateExpense, deleteExpense , } = require('../controllers/expenses')
const asyncWrapper = require('../middleware/async')


router.post('/expenses', asyncWrapper(createExpense))

router.get('/expenses/:id', asyncWrapper(getExpense))

router.get('/expenses', asyncWrapper(getExpenseAll))

router.patch('/expenses/:id', asyncWrapper(updateExpense))

router.delete('/expenses/:id', asyncWrapper(deleteExpense))


module.exports = router