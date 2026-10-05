const express = require('express');
const router = express.Router();

const menuItemsController = require('../controllers/menu-items');

router.get('/', menuItemsController.getAll);
router.get('/:id', menuItemsController.getSingle);
router.post('/', menuItemsController.createMenuItem);
router.put('/:id', menuItemsController.updateMenuItem);
router.delete('/:id', menuItemsController.deleteMenuItem);

module.exports = router;
