const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');
const { isAuthenticated } = require('../middleware/authenticate');

// Public routes: anyone can read orders.
router.get('/', ordersController.getAll);
router.get('/:id', ordersController.getSingle);

// Protected route: the user must be logged in with GitHub (OAuth).
router.post('/', isAuthenticated, (req, res, next) => {
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Order data. Requires an authenticated session. userId must be a valid MongoDB id; items must be a non-empty array.',
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

// Protected route: the user must be logged in with GitHub (OAuth).
router.put('/:id', isAuthenticated, (req, res, next) => {
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update (all optional, send at least one). Requires an authenticated session. status: pending, preparing, ready, completed, or cancelled. paymentMethod: cash, card, or online.',
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

// Protected route: the user must be logged in with GitHub (OAuth).
router.delete('/:id', isAuthenticated, (req, res, next) => {
  /* #swagger.description = 'Requires an authenticated session.' */
  ordersController.deleteOrder(req, res, next);
});

module.exports = router;