/*
  This controller manages the CRUD operations
  for restaurant orders.
*/

const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');

const COLLECTION = 'orders';
const VALID_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const VALID_PAYMENT_METHODS = ['cash', 'card', 'online'];

const getCollection = () => mongodb.getDb().collection(COLLECTION);

// Validate the request body. When partial is true (PUT), missing fields are allowed.
const validateOrder = (body, partial = false) => {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }

  const { userId, tableNumber, items, total, status, paymentMethod, notes } = body;

  if (!partial || userId !== undefined) {
    if (typeof userId !== 'string' || !ObjectId.isValid(userId)) {
      errors.push('userId is required and must be a valid id');
    }
  }
  if (!partial || tableNumber !== undefined) {
    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      errors.push('tableNumber is required and must be a positive integer');
    }
  }
  if (!partial || items !== undefined) {
    if (!Array.isArray(items) || items.length === 0) {
      errors.push('items is required and must be a non-empty array');
    }
  }
  if (!partial || total !== undefined) {
    if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) {
      errors.push('total is required and must be a number greater than or equal to 0');
    }
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (paymentMethod !== undefined && !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(`paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
  }
  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('notes must be a string');
  }

  return errors;
};

// Returns all orders.
const getAll = async (req, res) => {
  try {
    const orders = await getCollection().find().toArray();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Returns one order by ID.
const getSingle = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Creates a new order.
const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const errors = validateOrder(body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const order = {
      userId: new ObjectId(body.userId),
      tableNumber: body.tableNumber,
      items: body.items,
      total: body.total,
      status: body.status || 'pending',
      paymentMethod: body.paymentMethod || 'cash',
      notes: body.notes === undefined ? '' : body.notes.trim(),
      createdAt: new Date()
    };

    const result = await getCollection().insertOne(order);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Updates an existing order.
const updateOrder = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const body = req.body || {};
    const allowed = ['userId', 'tableNumber', 'items', 'total', 'status', 'paymentMethod', 'notes'];
    const updates = {};
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const errors = validateOrder(updates, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (updates.userId !== undefined) updates.userId = new ObjectId(updates.userId);
    if (updates.notes !== undefined) updates.notes = updates.notes.trim();

    const result = await getCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Deletes an order.
const deleteOrder = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAll,
  getSingle,
  createOrder,
  updateOrder,
  deleteOrder
};
