const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authenticate');
const usersController = require('../controllers/users');

// Public routes: anyone can read users.
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Protected route: the user must be logged in with GitHub OAuth.
router.post('/', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'User data. Requires an authenticated session. role can be customer, staff, or admin.',
        schema: {
            firstName: 'Davi',
            lastName: 'Vale',
            email: 'davi@example.com',
            phone: '43999999999',
            role: 'customer'
        }
    } */
    usersController.createUser(req, res, next);
});

// Protected route: the user must be logged in with GitHub OAuth.
router.put('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one). Requires an authenticated session. role can be customer, staff, or admin.',
        schema: {
            firstName: 'Davi',
            lastName: 'Vale',
            email: 'davi@example.com',
            phone: '43999999999',
            role: 'customer'
        }
    } */
    usersController.updateUser(req, res, next);
});

// Protected route: the user must be logged in with GitHub OAuth.
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;