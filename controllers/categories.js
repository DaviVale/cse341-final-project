const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');

const COLLECTION = 'categories';

const getCollection = () => mongodb.getDb().collection(COLLECTION);

// GET /categories
const getAllCategories = async (req, res) => {
  const categories = await getCollection().find().toArray();
  res.status(200).json(categories);
};

// GET /categories/:id
const getCategoryById = async (req, res) => {
  const category = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.status(200).json(category);
};

// POST /categories
const createCategory = async (req, res) => {
  const { name, description, isActive } = req.body;

  const category = {
    name,
    description: description || '',
    isActive: isActive !== undefined ? isActive : true,
    createdAt: new Date()
  };

  const result = await getCollection().insertOne(category);
  res.status(201).json({ id: result.insertedId });
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
  const { name, description, isActive } = req.body;

  const result = await getCollection().updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { name, description, isActive, updatedAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.status(204).send();
};

// DELETE /categories/:id
const deleteCategory = async (req, res) => {
  const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.status(200).json({ message: 'Category deleted successfully' });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
