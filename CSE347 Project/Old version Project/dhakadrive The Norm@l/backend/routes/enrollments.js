const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Enrollment = require('../models/Enrollment');

// Create new enrollment request
router.post('/', auth, async (req, res) => {
    const { courseName, userPreferredLocation } = req.body;
    try {
        const newEnrollment = new Enrollment({
            userId: req.user.id,
            userName: req.user.name,
            courseName,
            userPreferredLocation
        });
        const enrollment = await newEnrollment.save();
        res.json(enrollment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get enrollments for the logged-in user
router.get('/my-enrollments', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(enrollments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get all enrollments (admin only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    try {
        const enrollments = await Enrollment.find().sort({ date: -1 });
        res.json(enrollments);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update an enrollment (payment, status, location)
router.put('/:id', auth, async (req, res) => {
    try {
        const updateData = req.body;
        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        res.json(enrollment);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;