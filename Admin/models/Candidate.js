const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  skills: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);