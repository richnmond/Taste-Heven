const express = require('express');
const Order = require('../models/Order');
const { requireAuth } = require('../middleware/auth');
const { sendApprovalNotifications } = require('../services/notifications');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required.' });
  }

  const normalizedItems = items.map((item) => ({
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image || ''
  }));

  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    user: req.user._id,
    items: normalizedItems,
    total,
    status: 'pending'
  });

  res.json({ order });
});

router.get('/me', requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

router.get('/:id', requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
});

router.post('/:id/notify', requireAuth, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.status !== 'approved') {
    return res.status(400).json({ error: 'Order not approved yet.' });
  }

  await sendApprovalNotifications(order, req.user);
  res.json({ ok: true });
});

module.exports = router;
