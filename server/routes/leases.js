const router = require('express').Router();
const Lease = require('../models/Lease');
const Apartment = require('../models/Apartment'); // Updated from Property
const Notification = require('../models/Notification');
const { checkRents } = require('../utils/scheduler');

// 1. CREATE NEW LEASE 
router.post('/', async (req, res) => {
  try {
    const { 
      apartmentId, 
      tenantId, 
      startDate, 
      durationInYears, 
      agentId,
      rentAmount,   
      agencyFee,    
      legalFee,     
      cautionFee    
    } = req.body;

    // Calculate Dates
    const start = new Date(startDate);
    const end = new Date(start);
    const years = parseInt(durationInYears) || 1;
    const monthsToAdd = (years * 12) - 1; // End 1 month before the anniversary
    end.setMonth(start.getMonth() + monthsToAdd);

    // Calculate Total Package
    const totalPackage = Number(rentAmount) + Number(agencyFee) + Number(legalFee) + Number(cautionFee);

    const newLease = new Lease({
      apartmentId, 
      tenantId,
      startDate: start,
      endDate: end,
      
      // Financials
      rentAmount,
      agencyFee,
      legalFee,
      cautionFee,
      totalPackage,
      
      agentId
    });
    
    await newLease.save();

    // Mark the APARTMENT as Occupied 
    await Apartment.findByIdAndUpdate(apartmentId, { status: 'Occupied' });

    res.status(201).json(newLease);
  } catch (err) {
    console.error("Error creating lease:", err);
    res.status(500).json(err);
  }
});

// 2. GET ALL LEASES
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query;

    const leases = await Lease.find({ agentId }) 
      .populate('tenantId', 'name email')
      // Get Apartment details AND the parent Building details
      .populate({
        path: 'apartmentId',
        select: 'unitNumber type rentPrice', 
        populate: { 
          path: 'propertyId', 
          select: 'title address' 
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(leases);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. TERMINATE LEASE
router.put('/:id/terminate', async (req, res) => {
  try {
    const leaseId = req.params.id;
    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json("Lease not found");

    // 1. Mark Lease as Terminated
    lease.status = "Terminated";
    await lease.save();

    // 2. Make the APARTMENT Vacant again
    await Apartment.findByIdAndUpdate(lease.apartmentId, { status: "Vacant" });

    res.status(200).json({ message: "Lease terminated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. GET DASHBOARD NOTIFICATIONS
router.get('/notifications', async (req, res) => {
  try {
    const { agentId } = req.query;
    
    const alerts = await Notification.find({ agentId })
      .sort({ createdAt: -1 })
      .limit(5);
      
    res.status(200).json(alerts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. MANUAL TRIGGER 
router.post('/check-reminders', async (req, res) => {
  try {
    const count = await checkRents();
    res.status(200).json({ message: `Check complete. Generated ${count} alerts.` });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;