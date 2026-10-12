const express = require('express');
const router = express.Router();

const menuItemsController = require('../controllers/menu-items');

const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getSingle);
router.post('/', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Menu item data. Requires an authenticated session.',
        schema: {
            name: 'any',
            description: 'any',
            price: 29.9,
            categoryId: '6ac171ea973358fc0fee0899',
            isAvailable: true
        }
    } */
    menuItemsController.createMenuItem(req, res, next);
});
router.put('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one). Requires an authenticated session.',
        schema: {
            name: 'any',
            description: 'any',
            price: 29.9,
            categoryId: '6ac171ea973358fc0fee0899',
            isAvailable: true
        }
    } */
    menuItemsController.updateMenuItem(req, res, next);
});
router.delete('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.description = 'Requires an authenticated session.' */
    menuItemsController.deleteMenuItem(req, res, next);
});

module.exports = router;
