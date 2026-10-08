const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

const { isAuthenticated } = require('../middleware/authenticate');

// Public routes: anyone can read categories.
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);

// Protected routes: the user must be logged in with GitHub (OAuth).
router.post('/', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Category data',
        schema: {
            name: 'any',
            description: 'any',
            isActive: true
        }
    } */
    categoriesController.createCategory(req, res, next);
});

router.put('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one)',
        schema: {
            name: 'any',
            description: 'any',
            isActive: true
        }
    } */
    categoriesController.updateCategory(req, res, next);
});

router.delete('/:id', isAuthenticated, categoriesController.deleteCategory);

module.exports = router;