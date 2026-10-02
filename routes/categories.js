const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

router.get('/', categoriesController.getAllCategories); 
router.get('/:id', categoriesController.getCategoryById); 
router.post('/', categoriesController.createCategory); 
router.put('/:id', (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one)',
        schema: {
            name: 'any',
            description: 'any',
            isActive: 'any'
        }
    } */
    categoriesController.updateCategory(req, res, next);
});
router.delete('/:id', categoriesController.deleteCategory); 

module.exports = router;
