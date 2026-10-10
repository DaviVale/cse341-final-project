/*This file automatically generates the Swagger documentation for the REST API*/

// import swagger-autogen
const swaggerAutogen = require('swagger-autogen')();
// pass general information about the API to the swagger-autogen function
const doc = {
    info: {
        title: 'Restaurant Management API',
        description: 'CSE341 Final Project: API for Restaurant Management'
    },
    host: 'cse341-final-project-zbd7.onrender.com',
    schemes: ['https'],
    tags: [
        { name: 'System', description: 'API status and root endpoints' },
        { name: 'Authentication', description: 'GitHub OAuth login and session endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Categories', description: 'Menu category endpoints' },
        { name: 'Menu Items', description: 'Menu item endpoints' },
        { name: 'Orders', description: 'Order management endpoints' },
        { name: 'Documentation', description: 'API documentation endpoints' }
    ]
};

// Create an output file in the root directory to save the documentation
const outputFile = './swagger.json';
// Tell swagger-autogen where to look for the endpoints to document
const endpointsFiles = ['./server.js'];
// Call the swagger built-in function to generate the swagger documentation
swaggerAutogen(outputFile, endpointsFiles, doc);
