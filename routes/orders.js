const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');

// Order CRUD routes.
router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getSingle);
router.post('/', (req, res, next) => {
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Order data. userId must be a valid MongoDB id; items must be a non-empty array.',
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
  ordersController.createOrder(req, res, next);
});
router.put('/:id', (req, res, next) => {
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update (all optional, send at least one). status: pending, preparing, ready, completed, or cancelled. paymentMethod: cash, card, or online.',
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
