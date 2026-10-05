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
const menuItemsRoutes = require('./routes/menu-items');
const swaggerRoutes = require('./routes/swagger');

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

// menu-items routes.
app.use('/menu-items', menuItemsRoutes);

// Swagger routes.
app.use('/', swaggerRoutes);

// Validation for unknown routes and error handling middleware.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON request body' });
  }
  if (error.status === 413) {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  console.error('Unhandled request error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

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