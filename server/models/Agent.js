const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 90 days, 30 days, and 7 days before expiry
  reminderSettings: { 
    type: [Number], 
    default: [90, 30, 7] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);