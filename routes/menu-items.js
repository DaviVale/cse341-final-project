const express = require('express');
const router = express.Router();

const menuItemsController = require('../controllers/menu-items');

const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getSingle);
router.post('/', isAuthenticated, menuItemsController.createMenuItem);
router.put('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one)',
        schema: {
            name: 'any',
            description: 'any',
            price: 'any',
            categoryId: 'any',
            isAvailable: 'any'
        }
    } */
    menuItemsController.updateMenuItem(req, res, next);
});
router.delete('/:id', isAuthenticated, menuItemsController.deleteMenuItem);

module.exports = router;
