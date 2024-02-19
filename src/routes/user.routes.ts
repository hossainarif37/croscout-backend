
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
import { deleteUser, getAllUsers, getCurrentUser, getUserDataById, getUsersByRole, updatePassword, updateUser } from "../controllers/user.controller";



router
    //* Get the current user's profile
    //* Route
    /**
    * @route GET /current-user
    * @description Get if authenticated.
    * @access Private (Requires user authentication)
    */
    //* Middleware
    /**
     * @middleware isAuthenticateUser
     * @description Check if the user is authenticated before allowing access to certain routes.
     * @access Private
     */
    .get('/current-user', getCurrentUser)

    .get('/by-userid/:userId', getUserDataById)

    // Route for getting users by provided role
    .get('/users/by-role', getUsersByRole)

    // Route for getting all users
    .get('/all-users', getAllUsers)

    // Route for deleting a user (must be authenticated)
    .delete('/:userId', deleteUser)

    // Route for updating a user (must be authenticated)
    .put('/:userId', updateUser)

    // Route for updating a users password (must be authenticated)
    .patch('/update-password/:userId', updatePassword)

module.exports = router;