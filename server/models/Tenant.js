const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String }, 
  passportUrl: { type: String }, 
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' } 
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);