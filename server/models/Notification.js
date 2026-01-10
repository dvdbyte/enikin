const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  message: { type: String, required: true },
  tenantName: { type: String },
  daysRemaining: { type: Number },
  isRead: { type: Boolean, default: false },
  

  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true } 
  
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);