const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect'); // ES: asumí que connect.js exporta getDb() | PT: assumi que connect.js exporta getDb()

const COLLECTION = 'users';
const VALID_ROLES = ['customer', 'staff', 'admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getCollection = () => mongodb.getDb().collection(COLLECTION); // ES: si la función tiene otro nombre, cambiar solo acá | PT: se a função tiver outro nome, mudar só aqui

// Validate the request body. When partial is true (PUT), missing fields are allowed.
const validateUser = (body, partial = false) => {
  const errors = [];
  const { firstName, lastName, email, phone, role } = body;

  if (!partial || firstName !== undefined) {
    if (typeof firstName !== 'string' || firstName.trim() === '') {
      errors.push('firstName is required and must be a non-empty string');
    }
  }
  if (!partial || lastName !== undefined) {
    if (typeof lastName !== 'string' || lastName.trim() === '') {
      errors.push('lastName is required and must be a non-empty string');
    }
  }
  if (!partial || email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      errors.push('email is required and must be a valid email address');
    }
  }
  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('phone must be a string');
  }
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  return errors;
};

// GET /users
const getAllUsers = async (req, res) => {
  try {
    const users = await getCollection().find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// GET /users/:id
const getUserById = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

// POST /users
const createUser = async (req, res) => {
  try {
    const errors = validateUser(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const { firstName, lastName, email, phone, role } = req.body;
    const collection = getCollection();

    const existing = await collection.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const user = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      phone: phone || '',
      role: role || 'customer',
      createdAt: new Date()
    };

    const result = await collection.insertOne(user);
    res.status(201).json({ id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const body = req.body || {};
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'role'];
    const updates = {};
    for (const field of allowed) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const errors = validateUser(updates, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (updates.firstName) updates.firstName = updates.firstName.trim();
    if (updates.lastName) updates.lastName = updates.lastName.trim();
    if (updates.email) updates.email = updates.email.toLowerCase();

    const userId = new ObjectId(req.params.id);
    const collection = getCollection();

    if (updates.email) {
      const existing = await collection.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ message: 'A user with that email already exists' });
      }
    }

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// DELETE /users/:id
const deleteUser = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};