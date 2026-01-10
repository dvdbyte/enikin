const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  address: { type: String, required: true },
  

  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);