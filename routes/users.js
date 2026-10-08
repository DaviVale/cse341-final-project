const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authenticate');
const usersController = require('../controllers/users'); // ES: acá traigo las funciones del CRUD de usuarios | PT: aqui importo as funções do CRUD de usuários

router.get('/', usersController.getAllUsers); // ES: trae todos los usuarios | PT: retorna todos os usuários
router.get('/:id', usersController.getUserById); // ES: trae un usuario por su id | PT: retorna um usuário pelo id
router.post('/', isAuthenticated, usersController.createUser); // ES: crea un usuario nuevo | PT: cria um novo usuário
router.put('/:id', isAuthenticated, (req, res, next) => {
    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Fields to update (all optional, send at least one)',
        schema: {
            firstName: 'any',
            lastName: 'any',
            email: 'any',
            phone: 'any',
            role: 'any'
        }
    } */
    usersController.updateUser(req, res, next);
}); // ES: actualiza un usuario por su id | PT: atualiza um usuário pelo id
router.delete('/:id', isAuthenticated, usersController.deleteUser); // ES: borra un usuario por su id | PT: apaga um usuário pelo id

module.exports = router; // ES: falta conectarlo en server.js con app.use('/users', require('./routes/users')) | PT: falta conectar no server.js com app.use('/users', require('./routes/users'))