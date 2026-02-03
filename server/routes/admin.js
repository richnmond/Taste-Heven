const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendApprovalNotifications } = require('../services/notifications');

const router = express.Router();

router.get('/orders', requireAuth, requireAdmin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ orders });
});

router.post('/orders/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = 'approved';
  order.approvedAt = new Date();
  await order.save();

  const user = await User.findById(order.user._id);
  if (user) {
    await sendApprovalNotifications(order, user);
  }

  res.json({ order });
});

router.post('/orders/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const { notes } = req.body || {};
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = 'rejected';
  order.notes = notes || '';
  await order.save();

  res.json({ order });
});

module.exports = router;
