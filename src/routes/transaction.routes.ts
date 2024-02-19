const express = require('express');
import { getAllTransactions, getTransactionsByRole } from '../controllers/transaction.controller';
import { checkSecureUser } from '../middleware/authentication';

const router = express.Router();

router

    // Get all transactions
    .get('/', checkSecureUser, getAllTransactions)

    // Get transaction based on user role with userId parameter
    .get('/:userId', checkSecureUser, getTransactionsByRole)


module.exports = router;
