const mongoose = require('mongoose');

const LeaseSchema = new mongoose.Schema({
  
  apartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // FINANCIAL RECORD 
  rentAmount: { type: Number, required: true },   
  agencyFee: { type: Number, default: 0 },
  legalFee: { type: Number, default: 0 },
  cautionFee: { type: Number, default: 0 },
  totalPackage: { type: Number, required: true },  
  
  status: { type: String, default: 'Active' },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Lease', LeaseSchema);