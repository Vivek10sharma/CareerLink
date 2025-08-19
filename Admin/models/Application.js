const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
 status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'jobapplications' 
});

module.exports = mongoose.model('Application', applicationSchema);
