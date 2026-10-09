/*
  Unit tests for the Menu Items controller.
  The database is mocked, so these tests never touch MongoDB.
*/

jest.mock('../db/connect');

const mongodb = require('../db/connect');
const menuItemsController = require('../controllers/menu-items');
const { mockResponse, mockCollection } = require('./helpers');

const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Menu Items controller', () => {
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

  describe('GET /menu-items', () => {
    test('returns 200 with all menu items', async () => {
      const menuItems = [{ name: 'Soup' }, { name: 'Salad' }];
      collection.toArray.mockResolvedValue(menuItems);

      await menuItemsController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(menuItems);
    });

    test('returns 500 when the database fails', async () => {
      collection.toArray.mockRejectedValue(new Error('DB down'));

      await menuItemsController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /menu-items/:id', () => {
    test('returns 200 with the menu item', async () => {
      const menuItem = { _id: VALID_ID, name: 'Soup' };
      collection.findOne.mockResolvedValue(menuItem);

      await menuItemsController.getSingle({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(menuItem);
    });

    test('returns 400 for an invalid id', async () => {
      await menuItemsController.getSingle({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.findOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the menu item does not exist', async () => {
      collection.findOne.mockResolvedValue(null);

      await menuItemsController.getSingle({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /menu-items', () => {
    const validBody = {
      name: '  Tomato Soup  ',
      price: 12.5,
      categoryId: VALID_ID
    };

    test('returns 201, normalizes values, and applies defaults', async () => {
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await menuItemsController.createMenuItem({ body: validBody }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: VALID_ID });
      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.name).toBe('Tomato Soup');
      expect(saved.description).toBe('');
      expect(saved.price).toBe(12.5);
      expect(saved.categoryId.toString()).toBe(VALID_ID);
      expect(saved.isAvailable).toBe(true);
      expect(saved.createdAt).toBeInstanceOf(Date);
    });

    test('trims a provided description and accepts availability', async () => {
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await menuItemsController.createMenuItem({
        body: {
          ...validBody,
          description: '  Served hot  ',
          isAvailable: false
        }
      }, res);

      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.description).toBe('Served hot');
      expect(saved.isAvailable).toBe(false);
    });

    test('returns 400 when required fields are missing', async () => {
      await menuItemsController.createMenuItem({ body: { name: 'Soup' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });

    test('returns 400 for invalid menu item values', async () => {
      await menuItemsController.createMenuItem({
        body: { ...validBody, price: -1, isAvailable: 'yes' }
      }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('PUT /menu-items/:id', () => {
    test('returns 204 and normalizes updated fields', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 1 });

      await menuItemsController.updateMenuItem({
        params: { id: VALID_ID },
        body: { name: '  Garden Salad  ', categoryId: VALID_ID }
      }, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      const [filter, update] = collection.updateOne.mock.calls[0];
      expect(filter._id.toString()).toBe(VALID_ID);
      expect(update.$set.name).toBe('Garden Salad');
      expect(update.$set.categoryId.toString()).toBe(VALID_ID);
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
    });

    test('returns 400 for an invalid id', async () => {
      await menuItemsController.updateMenuItem(
        { params: { id: 'abc' }, body: { name: 'Soup' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 400 when no valid fields are sent', async () => {
      await menuItemsController.updateMenuItem(
        { params: { id: VALID_ID }, body: {} },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 400 for an invalid field value', async () => {
      await menuItemsController.updateMenuItem(
        { params: { id: VALID_ID }, body: { price: -1 } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the menu item does not exist', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await menuItemsController.updateMenuItem(
        { params: { id: VALID_ID }, body: { isAvailable: false } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /menu-items/:id', () => {
    test('returns 200 when the menu item is deleted', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await menuItemsController.deleteMenuItem({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 400 for an invalid id', async () => {
      await menuItemsController.deleteMenuItem({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.deleteOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the menu item does not exist', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await menuItemsController.deleteMenuItem({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
