/*This file automatically generates the Swagger documentation for the REST API*/

// import swagger-autogen
const swaggerAutogen = require('swagger-autogen')();
// pass general information about the API to the swagger-autogen function
const doc = {
    info: {
        title: 'Restaurant Management API',
        description: 'CSE341 Final Project: API for Restaurant Management'
    },
    host: 'localhost:3000',    // In the swagger.JSON, change for the render url containing our project  
    schemes: ['http', 'https']
};

// Create an output file in the root directory to save the documentation
const outputFile = './swagger.json';
// Tell swagger-autogen where to look for the endpoints to document
const endpointsFiles = ['./server.js'];
// Call the swagger built-in function to generate the swagger documentation
swaggerAutogen(outputFile, endpointsFiles, doc);
