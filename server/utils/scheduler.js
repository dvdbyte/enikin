const CronJob = require('node-cron');
const Lease = require('../models/Lease');
const Notification = require('../models/Notification');

const checkRents = async () => {
  console.log("Running Rent Check...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const leases = await Lease.find({ status: 'Active' })
      .populate('tenantId')
      .populate({
        path: 'apartmentId',
        populate: { path: 'propertyId' }
      });

    let count = 0;

    for (const lease of leases) {
      if (!lease.endDate) continue;

      const end = new Date(lease.endDate);
      end.setHours(0, 0, 0, 0);

      const diffTime = end - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let message = "";
      let type = "Info";

      if (daysRemaining === 90) {
        message = `3 Months Notice: Contract for ${lease.tenantId?.name} expires in 90 days. Check renewal intent.`;
      } else if (daysRemaining === 30) {
        message = `1 Month Notice: Rent due in 30 days for ${lease.tenantId?.name}. Send Invoice.`;
        type = "Warning";
      } else if (daysRemaining === 7) {
        message = `Urgent: Rent due in 1 week for ${lease.tenantId?.name}. Send Reminder.`;
        type = "Urgent";
      } else if (daysRemaining === 0) {
        message = `DUE DATE: Rent is due TODAY for ${lease.tenantId?.name}. Collect Payment.`;
        type = "Critical";
      }

      if (message) {
        const exists = await Notification.findOne({ 
          leaseId: lease._id, 
          createdAt: { $gte: today } 
        });

        if (!exists) {
          await Notification.create({
            agentId: lease.agentId,
            leaseId: lease._id,
            message: message,
            type: type,
            daysRemaining: daysRemaining,
            isRead: false
          });
          count++;
        }
      }
    }
    console.log(`Generated ${count} notifications.`);
    return count;
  } catch (err) {
    console.error("Scheduler Error:", err);
  }
};


const startScheduler = () => {
  // Run every day at 7:00 AM
  CronJob.schedule('0 7 * * *', checkRents);
  console.log("📅 Rental Scheduler is running...");
};

// EXPORT THE FUNCTION
module.exports = { startScheduler, checkRents };