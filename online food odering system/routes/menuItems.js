const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// GET /menu-items - list all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.findAll({ order: [['createdAt', 'DESC']] });
    res.render('menu-items/index', { title: 'Menu Items', items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /menu-items/new - show create form
router.get('/new', (req, res) => {
  res.render('menu-items/new', { title: 'Add Menu Item' });
});

// POST /menu-items - create menu item
router.post('/', async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;
  try {
    await MenuItem.create({
      name,
      description,
      price,
      category,
      isAvailable: isAvailable === 'on',
    });
    res.redirect('/menu-items');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create menu item');
  }
});

// GET /menu-items/:id - show details
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send('Menu item not found');
    }
    res.render('menu-items/show', { title: 'Menu Item Details', item });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /menu-items/:id/edit - edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send('Menu item not found');
    }
    res.render('menu-items/edit', { title: 'Edit Menu Item', item });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /menu-items/:id - update item
router.put('/:id', async (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send('Menu item not found');
    }
    await item.update({
      name,
      description,
      price,
      category,
      isAvailable: isAvailable === 'on',
    });
    res.redirect('/menu-items');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update menu item');
  }
});

// DELETE /menu-items/:id - delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).send('Menu item not found');
    }
    await item.destroy();
    res.redirect('/menu-items');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete menu item');
  }
});

module.exports = router;

