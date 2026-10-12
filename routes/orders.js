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
      description: 'Order data. Requires an authenticated session. userId must be a valid MongoDB id; tableNumber must be a positive integer; items must be a non-empty array; status can be pending, preparing, ready, completed, or cancelled; paymentMethod can be cash, card, or online.',
      schema: {
          userId: '6abf9d1368270732931bab7b',
          tableNumber: 5,
          items: [
              {
                  name: 'Week 06 Burger',
                  quantity: 1,
                  price: 29.9
              }
          ],
          total: 29.9,
          status: 'pending',
          paymentMethod: 'card',
          notes: 'Week 06 video test'
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
          userId: '6abf9d1368270732931bab7b',
          tableNumber: 5,
          items: [
              {
                  name: 'Week 06 Burger',
                  quantity: 1,
                  price: 29.9
              }
          ],
          total: 29.9,
          status: 'preparing',
          paymentMethod: 'card',
          notes: 'Updated order'
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