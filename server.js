/*
  This is the main file of the Restaurant Management API.
  It starts the Express server, connects to MongoDB,
  and loads the application routes.
*/

require('dotenv').config();

const express = require('express');
const mongodb = require('./db/connect');

const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const menuItemsRoutes = require('./routes/menu-items');
const ordersRoutes = require('./routes/orders');

const swaggerRoutes = require('./routes/swagger');

const app = express();
const port = process.env.PORT || 3000;

// use session to persist user authentication across requests
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));


app.use(passport.initialize());
app.use(passport.session());

// Configure GitHub OAuth authentication using Passport
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACKURL
},
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

// Store the authenticated user in the session
passport.serializeUser((user, done) => done(null, user));
// Retrieve the authenticated user from the session
passport.deserializeUser((user, done) => done(null, user));

// Main route used to verify if the user is logged in
app.get('/', (req, res) => {
    /* #swagger.tags = ['System'] */
    res.send(
        req.session.user !== undefined
            ? `Logged in as ${req.session.user.username}`
            : 'Logged Out'
    );
});

// Start GitHub OAuth login
app.get('/login', (req, res, next) => {
    /* #swagger.tags = ['Authentication'] */
    passport.authenticate('github')(req, res, next);
});

// Log out the authenticated user
app.get('/logout', (req, res, next) => {
    /* #swagger.tags = ['Authentication'] */
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy(() => res.redirect('/'));
    });
});

// GitHub OAuth callback route.
app.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/api-docs',
        session: false
    }),
    (req, res, next) => {
        /* #swagger.tags = ['Authentication'] */
        console.log('Callback OK, user:', req.user && req.user.username);

        req.session.user = {
            id: req.user.id,
            username: req.user.username,
            displayName: req.user.displayName
        };

        req.session.save((err) => {
            if (err) {
                return next(err);
            }

            res.redirect('/');
        });
    }
);


// Allows the API to receive JSON data.
app.use(express.json());



// Users routes.
app.use('/users', /* #swagger.tags = ['Users'] */ usersRoutes);

// Categories routes.
app.use('/categories', /* #swagger.tags = ['Categories'] */ categoriesRoutes);

// menu-items routes.
app.use('/menu-items', /* #swagger.tags = ['Menu Items'] */ menuItemsRoutes);

// Orders routes.
app.use('/orders', /* #swagger.tags = ['Orders'] */ ordersRoutes);

// Swagger routes.
app.use('/', /* #swagger.tags = ['Documentation'] */ swaggerRoutes);

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