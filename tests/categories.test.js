/*
  Unit tests for the Categories controller and its OAuth protection.
  The database is mocked, so these tests never touch MongoDB.
*/

jest.mock('../db/connect');

const mongodb = require('../db/connect');
const categoriesController = require('../controllers/categories');
const { isAuthenticated } = require('../middleware/authenticate');
const { mockResponse, mockCollection } = require('./helpers');

const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Categories controller', () => {
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

  describe('GET /categories', () => {
    test('returns 200 with all categories', async () => {
      const categories = [{ name: 'Drinks' }, { name: 'Desserts' }];
      collection.toArray.mockResolvedValue(categories);

      await categoriesController.getAllCategories({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(categories);
    });

    test('returns 500 when the database fails', async () => {
      collection.toArray.mockRejectedValue(new Error('DB down'));

      await categoriesController.getAllCategories({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /categories/:id', () => {
    test('returns 200 with the category', async () => {
      const category = { _id: VALID_ID, name: 'Drinks' };
      collection.findOne.mockResolvedValue(category);

      await categoriesController.getCategoryById({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(category);
    });

    test('returns 400 for an invalid id', async () => {
      await categoriesController.getCategoryById({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.findOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the category does not exist', async () => {
      collection.findOne.mockResolvedValue(null);

      await categoriesController.getCategoryById({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /categories', () => {
    test('returns 201 and applies default values', async () => {
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await categoriesController.createCategory({ body: { name: '  Drinks  ' } }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: VALID_ID });
      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.name).toBe('Drinks');
      expect(saved.description).toBe('');
      expect(saved.isActive).toBe(true);
    });

    test('returns 400 when name is missing', async () => {
      await categoriesController.createCategory({ body: { description: 'Cold' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });

    test('returns 400 when isActive is not a boolean', async () => {
      await categoriesController.createCategory(
        { body: { name: 'Drinks', isActive: 'yes' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('PUT /categories/:id', () => {
    test('returns 204 when the category is updated', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 1 });

      await categoriesController.updateCategory(
        { params: { id: VALID_ID }, body: { isActive: false } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(204);
    });

    test('returns 400 for an invalid id', async () => {
      await categoriesController.updateCategory(
        { params: { id: 'abc' }, body: { name: 'Drinks' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 when the category does not exist', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await categoriesController.updateCategory(
        { params: { id: VALID_ID }, body: { name: 'Drinks' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    test('returns 200 when the category is deleted', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await categoriesController.deleteCategory({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the category does not exist', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await categoriesController.deleteCategory({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

describe('Categories OAuth protection (isAuthenticated)', () => {
  test('returns 401 when the user is not logged in', () => {
    const res = mockResponse();
    const next = jest.fn();

    isAuthenticated({ session: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() when the user is logged in', () => {
    const res = mockResponse();
    const next = jest.fn();

    isAuthenticated({ session: { user: { username: 'Sebasosax' } } }, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});