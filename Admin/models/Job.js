const mongoose = require('mongoose');


const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  category: String,
  location: String,
 recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
