/*
  Unit tests for the Orders controller.
  The database is mocked, so these tests never touch MongoDB.
*/

jest.mock('../db/connect');

const mongodb = require('../db/connect');
const ordersController = require('../controllers/orders');
const { mockResponse, mockCollection } = require('./helpers');

const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';

describe('Orders controller', () => {
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

  describe('GET /orders', () => {
    test('returns 200 with all orders', async () => {
      const orders = [{ tableNumber: 1 }, { tableNumber: 2 }];
      collection.toArray.mockResolvedValue(orders);

      await ordersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    test('returns 500 when the database fails', async () => {
      collection.toArray.mockRejectedValue(new Error('DB down'));

      await ordersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /orders/:id', () => {
    test('returns 200 with the order', async () => {
      const order = { _id: VALID_ID, tableNumber: 1 };
      collection.findOne.mockResolvedValue(order);

      await ordersController.getSingle({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    test('returns 400 for an invalid id', async () => {
      await ordersController.getSingle({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.findOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the order does not exist', async () => {
      collection.findOne.mockResolvedValue(null);

      await ordersController.getSingle({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('POST /orders', () => {
    const validBody = {
      userId: VALID_ID,
      tableNumber: 5,
      items: [{ menuItemId: VALID_ID, quantity: 2 }],
      total: 24.5
    };

    test('returns 201, converts the user id, and applies defaults', async () => {
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await ordersController.createOrder({ body: validBody }, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: VALID_ID });
      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.userId.toString()).toBe(VALID_ID);
      expect(saved.status).toBe('pending');
      expect(saved.paymentMethod).toBe('cash');
      expect(saved.notes).toBe('');
      expect(saved.createdAt).toBeInstanceOf(Date);
    });

    test('trims notes and accepts valid optional values', async () => {
      collection.insertOne.mockResolvedValue({ insertedId: VALID_ID });

      await ordersController.createOrder({
        body: {
          ...validBody,
          status: 'preparing',
          paymentMethod: 'card',
          notes: '  No onions  '
        }
      }, res);

      const saved = collection.insertOne.mock.calls[0][0];
      expect(saved.status).toBe('preparing');
      expect(saved.paymentMethod).toBe('card');
      expect(saved.notes).toBe('No onions');
    });

    test('returns 400 when required fields are missing', async () => {
      await ordersController.createOrder({ body: { userId: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });

    test('returns 400 for invalid order values', async () => {
      await ordersController.createOrder({
        body: { ...validBody, tableNumber: 0, status: 'shipped' }
      }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.insertOne).not.toHaveBeenCalled();
    });
  });

  describe('PUT /orders/:id', () => {
    test('returns 204 and normalizes updated fields', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 1 });

      await ordersController.updateOrder({
        params: { id: VALID_ID },
        body: { userId: VALID_ID, notes: '  Extra napkins  ' }
      }, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      const [filter, update] = collection.updateOne.mock.calls[0];
      expect(filter._id.toString()).toBe(VALID_ID);
      expect(update.$set.userId.toString()).toBe(VALID_ID);
      expect(update.$set.notes).toBe('Extra napkins');
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
    });

    test('returns 400 for an invalid id', async () => {
      await ordersController.updateOrder(
        { params: { id: 'abc' }, body: { status: 'ready' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 400 when no valid fields are sent', async () => {
      await ordersController.updateOrder({ params: { id: VALID_ID }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 400 for an invalid field value', async () => {
      await ordersController.updateOrder(
        { params: { id: VALID_ID }, body: { status: 'shipped' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.updateOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the order does not exist', async () => {
      collection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await ordersController.updateOrder(
        { params: { id: VALID_ID }, body: { status: 'ready' } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /orders/:id', () => {
    test('returns 200 when the order is deleted', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await ordersController.deleteOrder({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 400 for an invalid id', async () => {
      await ordersController.deleteOrder({ params: { id: 'abc' } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(collection.deleteOne).not.toHaveBeenCalled();
    });

    test('returns 404 when the order does not exist', async () => {
      collection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await ordersController.deleteOrder({ params: { id: VALID_ID } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
