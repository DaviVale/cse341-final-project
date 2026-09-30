/*
  This file manages the connection between the application
  and the MongoDB database.
*/

const { MongoClient } = require('mongodb');

let database;

// Connects the application to MongoDB.
const initDb = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();

    database = client.db(process.env.DATABASE_NAME);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

// Returns the active database connection.
const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized');
  }

  return database;
};

module.exports = {
  initDb,
  getDb
};