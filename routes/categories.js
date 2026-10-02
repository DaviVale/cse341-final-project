const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

router.get('/', categoriesController.getAllCategories); 
router.get('/:id', categoriesController.getCategoryById); 
router.post('/', (req, res, next) => {

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Category data',
        schema: {
            name: 'any',
            description: 'any',
            isActive: true
        }
    } */

    categoriesController.createCategory(req, res, next);

});
router.put('/:id', (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one)',
        schema: {
            name: 'any',
            description: 'any',
            isActive: true
        }
    } */
    categoriesController.updateCategory(req, res, next);
});
router.delete('/:id', categoriesController.deleteCategory); 

module.exports = router;
