const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const swaggerMiddleware = swaggerUi.setup(swaggerDocument);

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', (req, res, next) => {
    /* #swagger.tags = ['Documentation'] */
    swaggerMiddleware(req, res, next);
});

module.exports = router;
