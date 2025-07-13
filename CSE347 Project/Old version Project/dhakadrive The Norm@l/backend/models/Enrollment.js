const mongoose = require('mongoose');
const EnrollmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    courseName: { type: String, required: true },
    userPreferredLocation: { type: String, required: true },
    assignedLocation: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    trxId: { type: String, default: null },
    status: { type: String, default: 'Requested' },
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Enrollment', EnrollmentSchema);