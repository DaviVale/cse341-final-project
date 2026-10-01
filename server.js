/*
  This is the main file of the Restaurant Management API.
  It starts the Express server, connects to MongoDB,
  and loads the application routes.
*/

require('dotenv').config();

const express = require('express');
const mongodb = require('./db/connect');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');

const app = express();
const port = process.env.PORT || 3000;

// Allows the API to receive JSON data.
app.use(express.json());

/// Main route used to verify that the API is running.
app.get('/', (req, res) => {
  res.status(200).send('Restaurant Management API is running');
});

// Users routes.
app.use('/users', usersRoutes);

// Categories routes.
app.use('/categories', categoriesRoutes);

// Connect to MongoDB before starting the server.
mongodb
  .initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Server could not start:', error);
  });