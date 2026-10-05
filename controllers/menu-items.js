const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    const result = await mongodb
        .getDb()
        .collection('menuItems')
        .find();
    
    const menuItems = await result.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(menuItems);
};

const getSingle = async (req, res) => {
    const menuItemId = new ObjectId(req.params.id);

    const result = await mongodb
        .getDb()
        .collection('menuItems')
        .find({ _id: menuItemId });
    
    const menuItem = await result.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(menuItem);
};

const createMenuItem = async (req, res) => {
    const menuItem = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        categoryId: new ObjectId(req.body.categoryId),
        isAvailable: req.body.isAvailable
    };

    const response = await mongodb
        .getDb()
        .collection('menuItems')
        .insertOne(menuItem);

    res.status(201).json(response);
};

const updateMenuItem = async (req, res) => {
    const menuItemId = new ObjectId(req.params.id);

    const menuItem = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        categoryId: new ObjectId(req.body.categoryId),
        isAvailable: req.body.isAvailable
    };

    await mongodb
        .getDb()
        .collection('menuItems')
        .updateOne({ _id: menuItemId }, { $set: menuItem });
    
    res.status(204).send();
};

const deleteMenuItem = async (req, res) => {
    const menuItemId = new ObjectId(req.params.id);

    await mongodb
        .getDb()
        .collection('menuItems')
        .deleteOne({ _id: menuItemId });

    res.status(204).send();
};

module.exports = {
    getAll,
    getSingle,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};