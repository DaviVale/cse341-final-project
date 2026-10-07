const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');

const COLLECTION = 'menuItems';

const getCollection = () => mongodb.getDb().collection(COLLECTION);

// Validate the request body. When partial is true (PUT), missing fields are allowed.
const validateMenuItem = (body, partial = false) => {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }

  const { name, description, price, categoryId, isAvailable } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string');
  }
  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      errors.push('price is required and must be a number greater than or equal to 0');
    }
  }
  if (!partial || categoryId !== undefined) {
    if (typeof categoryId !== 'string' || !ObjectId.isValid(categoryId)) {
      errors.push('categoryId is required and must be a valid id');
    }
  }
  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean');
  }

  return errors;
};

// GET /menu-items
const getAll = async (req, res) => {
  try {
    const menuItems = await getCollection().find().toArray();
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error retrieving menu items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /menu-items/:id
const getSingle = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const menuItem = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(menuItem);
  } catch (error) {
    console.error('Error retrieving menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /menu-items
const createMenuItem = async (req, res) => {
  try {
    const body = req.body || {};
    const errors = validateMenuItem(body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const menuItem = {
      name: body.name.trim(),
      description: body.description === undefined ? '' : body.description.trim(),
      price: body.price,
      categoryId: new ObjectId(body.categoryId),
      isAvailable: body.isAvailable === undefined ? true : body.isAvailable,
      createdAt: new Date()
    };

    const result = await getCollection().insertOne(menuItem);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /menu-items/:id
const updateMenuItem = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const body = req.body || {};
    const allowed = ['name', 'description', 'price', 'categoryId', 'isAvailable'];
    const updates = {};
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const errors = validateMenuItem(updates, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (updates.name !== undefined) updates.name = updates.name.trim();
    if (updates.description !== undefined) updates.description = updates.description.trim();
    if (updates.categoryId !== undefined) updates.categoryId = new ObjectId(updates.categoryId);

    const result = await getCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /menu-items/:id
const deleteMenuItem = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid menu item id' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAll,
  getSingle,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
