const router = require('express').Router();
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const Notification = require('../models/Notification');

router.get('/stats', async (req, res) => {
  try {
  
    const [tenantCount, propertyCount, vacantCount, activeLeases] = await Promise.all([
      Tenant.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ status: 'Vacant' }),
      Lease.countDocuments({ status: 'Active' })
    ]);

    // Get latest 5 unread notifications
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      stats: {
        tenants: tenantCount,
        properties: propertyCount,
        vacant: vacantCount,
        leases: activeLeases
      },
      notifications
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;