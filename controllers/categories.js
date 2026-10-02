const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');

const COLLECTION = 'categories';

const getCollection = () => mongodb.getDb().collection(COLLECTION);

// Validate the request body. When partial is true (PUT), missing fields are allowed.
const validateCategory = (body, partial = false) => {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object'];
  }

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string');
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return errors;
};

// GET /categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await getCollection().find().toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /categories/:id
const getCategoryById = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const category = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /categories
const createCategory = async (req, res) => {
  try {
    const body = req.body || {};
    const errors = validateCategory(body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const category = {
      name: body.name.trim(),
      description: body.description === undefined ? '' : body.description.trim(),
      isActive: body.isActive === undefined ? true : body.isActive,
      createdAt: new Date()
    };

    const result = await getCollection().insertOne(category);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const body = req.body || {};
    const allowed = ['name', 'description', 'isActive'];
    const updates = {};
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const errors = validateCategory(updates, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (updates.name !== undefined) updates.name = updates.name.trim();
    if (updates.description !== undefined) updates.description = updates.description.trim();

    const result = await getCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /categories/:id
const deleteCategory = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }
    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
