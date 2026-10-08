/*
  Unit tests for the Users controller.
  The database is mocked, so these tests never touch MongoDB.
*/

jest.mock('../db/connect');

const mongodb = require('../db/connect');
const usersController = require('../controllers/users');
const { mockResponse, mockCollection } = require('./helpers');

const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Users controller', () => {
  let collection;
  let res;

  beforeEach(() => {
    collection = mockCollection();
    mongodb.getDb.mockReturnValue({ collection: () => collection });
    res = mockResponse();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /users', () => {
    test('returns 200 with all users', async () => {
      const users = [{ firstName: 'Juan' }, { firstName: 'Davi' }];
      collection.toArray.mockResolvedValue(users);

      await usersController.getAllUsers({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    test('returns 500 when the database fails', async () => {
      collection.toArray.mockRejectedValue(new Error('DB down'));

      await usersController.getAllUsers({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /users/:id', () => {
    test('returns 200 with the user', async () => {
      const user = { _id: VALID_ID, firstName: 'Juan' };
      collection.findOne.mockResolvedValue(user);

      await usersController.getUserById({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    test('returns 400 for an invalid id', async () => {
      await usersController.getUserById({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.findOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the user does not exist', async () => {
      collection.findOne.mockResolvedValue(null);

      await usersController.getUserById({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /users', () => {
    const validBody = {
      firstName: 'Juan',
      lastName: 'Sosa',
      email: 'Juan@Example.com'
    };

    test('returns 201 and saves a normalized user', async () => {
      collection.findOne.mockResolvedValue(null);
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await usersController.createUser({ body: validBody }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: VALID_ID });
      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.email).toBe('juan@example.com');
      expect(saved.role).toBe('customer');
    });

    test('returns 400 when required fields are missing', async () => {
      await usersController.createUser({ body: { firstName: 'Juan' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });

    test('returns 400 for an invalid role', async () => {
      await usersController.createUser({ body: { ...validBody, role: 'boss' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 409 when the email already exists', async () => {
      collection.findOne.mockResolvedValue({ _id: VALID_ID });

      await usersController.createUser({ body: validBody }, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    test('returns 204 when the user is updated', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 1 });

      await usersController.updateUser(
        { params: { id: VALID_ID }, body: { firstName: 'Sebas' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(204);
    });

    test('returns 400 when no valid fields are sent', async () => {
      await usersController.updateUser({ params: { id: VALID_ID }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 when the user does not exist', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await usersController.updateUser(
        { params: { id: VALID_ID }, body: { firstName: 'Sebas' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /users/:id', () => {
    test('returns 200 when the user is deleted', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await usersController.deleteUser({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the user does not exist', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await usersController.deleteUser({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});