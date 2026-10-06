const express = require('express');
const router = express.Router();

const menuItemsController = require('../controllers/menu-items');

const { isAuthenticated } = require('../middleware/authenticate');

router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getSingle);
router.post('/', isAuthenticated, menuItemsController.createMenuItem);
router.put('/:id', isAuthenticated, menuItemsController.updateMenuItem);
router.delete('/:id', isAuthenticated, menuItemsController.deleteMenuItem);

module.exports = router;
