const mongoose = require('mongoose');


const recruiterSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  company: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recruiter', recruiterSchema);