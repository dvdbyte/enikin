const mongoose = require('mongoose');

const LandlordSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }] 
}, { timestamps: true });

module.exports = mongoose.model('Landlord', LandlordSchema);