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
            $userId: '6abf9d3568270732931bab7c',
            $tableNumber: 5,
            $items: [
                {
                    $menuItemId: '6ac3dc8c0cd32077afc81c0b',
                    $quantity: 2
                }
            ],
            $total: 7.98,
            $status: 'pending',
            $paymentMethod: 'cash',
            $notes: 'No onions'
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
        $userId: '6abf9d3568270732931bab7c',
        $tableNumber: 5,
        $items: [
            {
                $menuItemId: '6ac3dc8c0cd32077afc81c0b',
                $quantity: 2
            }
        ],
        $total: 7.98,
        $status: 'preparing',
        $paymentMethod: 'card',
        $notes: 'Extra napkins'
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