const express = require('express');
import { getAllTransactions, getTransactionsByRole } from '../controllers/transaction.controller';

const router = express.Router();

router

    // Get all transactions
    .get('/', getAllTransactions)

    // Get transaction based on user role with userId parameter
    .get('/:userId', getTransactionsByRole)


module.exports = router;
