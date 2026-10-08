// Shared helpers for controller unit tests.

// Builds a fake Express response object whose methods can be inspected.
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Builds a fake MongoDB collection. Each method is a jest mock
// so every test can decide what the "database" returns.
const mockCollection = () => {
  const toArray = jest.fn();
  return {
    find: jest.fn(() => ({ toArray })),
    toArray,
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn()
  };
};

module.exports = { mockResponse, mockCollection };