const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
}, { collection: 'admins' }); 

module.exports = mongoose.model('Admin', adminSchema);
