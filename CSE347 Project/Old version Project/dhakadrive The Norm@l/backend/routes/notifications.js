const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Create a notification (admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    const { userId, message } = req.body;
    try {
        const newNotification = new Notification({ userId, message });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get notifications for the logged-in user
router.get('/my-notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;