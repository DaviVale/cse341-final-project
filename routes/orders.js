const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');

// Order CRUD routes.
router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getSingle);
router.post('/', ordersController.createOrder);
router.put('/:id', (req, res, next) => {
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update (all optional, send at least one)',
      schema: {
          userId: 'any',
          tableNumber: 'any',
          items: 'any',
          total: 'any',
          status: 'any',
          paymentMethod: 'any',
          notes: 'any'
      }
  } */
  ordersController.updateOrder(req, res, next);
});
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
