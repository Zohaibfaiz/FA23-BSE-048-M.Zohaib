const express = require('express');
const router = express.Router();
const { Order, OrderItem } = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// GET /orders - list all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: MenuItem,
    });
    res.render('orders/index', { title: 'Orders', orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /orders/new - create order form
router.get('/new', async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({ where: { isAvailable: true } });
    res.render('orders/new', { title: 'Create Order', menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /orders - create order
router.post('/', async (req, res) => {
  const { customerName, customerPhone, status, menuItemIds, quantities } = req.body;

  try {
    const order = await Order.create({
      customerName,
      customerPhone,
      status: status || 'Pending',
    });

    if (menuItemIds) {
      const ids = Array.isArray(menuItemIds) ? menuItemIds : [menuItemIds];
      const qtys = Array.isArray(quantities) ? quantities : [quantities];

      for (let i = 0; i < ids.length; i++) {
        const quantity = parseInt(qtys[i], 10) || 1;
        if (!ids[i]) continue;
        await OrderItem.create({
          OrderId: order.id,
          MenuItemId: ids[i],
          quantity,
        });
      }
    }

    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create order');
  }
});

// GET /orders/:id - show order details
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: MenuItem,
    });
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.render('orders/show', { title: 'Order Details', order });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /orders/:id/edit - edit order
router.get('/:id/edit', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: MenuItem,
    });
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const menuItems = await MenuItem.findAll({ where: { isAvailable: true } });
    res.render('orders/edit', { title: 'Edit Order', order, menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /orders/:id - update order basic fields (not reworking items heavily)
router.put('/:id', async (req, res) => {
  const { customerName, customerPhone, status } = req.body;
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    await order.update({ customerName, customerPhone, status });
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update order');
  }
});

// DELETE /orders/:id - delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    await order.destroy();
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete order');
  }
});

module.exports = router;

