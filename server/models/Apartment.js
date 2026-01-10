const mongoose = require('mongoose');

const ApartmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  
  // Financials
  rentPrice: { type: Number, required: true },
  agencyFee: { type: Number, default: 0 },
  legalFee: { type: Number, default: 0 },
  cautionFee: { type: Number, default: 0 },
  
  status: { type: String, default: 'Vacant' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Apartment', ApartmentSchema);