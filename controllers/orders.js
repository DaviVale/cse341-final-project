/*
  This controller manages the CRUD operations
  for restaurant orders.
*/

const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

// Returns all orders.
const getAll = async (req, res) => {
  const result = await mongodb
    .getDb()
    .collection('orders')
    .find();

  const orders = await result.toArray();

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(orders);
};

// Returns one order by ID.
const getSingle = async (req, res) => {
  const orderId = new ObjectId(req.params.id);

  const result = await mongodb
    .getDb()
    .collection('orders')
    .find({ _id: orderId });

  const order = await result.toArray();

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(order);
};

// Creates a new order.
const createOrder = async (req, res) => {
  const order = {
    userId: req.body.userId,
    tableNumber: req.body.tableNumber,
    items: req.body.items,
    total: req.body.total,
    status: req.body.status,
    paymentMethod: req.body.paymentMethod,
    notes: req.body.notes,
    createdAt: new Date()
  };

  const response = await mongodb
    .getDb()
    .collection('orders')
    .insertOne(order);

  res.status(201).json(response);
};

// Updates an existing order.
const updateOrder = async (req, res) => {
  const orderId = new ObjectId(req.params.id);

  const order = {
    userId: req.body.userId,
    tableNumber: req.body.tableNumber,
    items: req.body.items,
    total: req.body.total,
    status: req.body.status,
    paymentMethod: req.body.paymentMethod,
    notes: req.body.notes,
    updatedAt: new Date()
  };

  await mongodb
    .getDb()
    .collection('orders')
    .updateOne({ _id: orderId }, { $set: order });

  res.status(204).send();
};

// Deletes an order.
const deleteOrder = async (req, res) => {
  const orderId = new ObjectId(req.params.id);

  await mongodb
    .getDb()
    .collection('orders')
    .deleteOne({ _id: orderId });

  res.status(204).send();
};

module.exports = {
  getAll,
  getSingle,
  createOrder,
  updateOrder,
  deleteOrder
};