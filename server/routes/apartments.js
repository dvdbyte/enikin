const router = require('express').Router();
const Apartment = require('../models/Apartment');

// 1. CREATE APARTMENT
router.post('/', async (req, res) => {
  try {
    const newApartment = new Apartment(req.body);
    const savedApartment = await newApartment.save();
    res.status(201).json(savedApartment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET APARTMENTS 
router.get('/', async (req, res) => {
  try {
    const { agentId, propertyId } = req.query;
    
    let filter = { agentId };
    if (propertyId) {
      filter.propertyId = propertyId;
    }

    const apartments = await Apartment.find(filter)
      // Get Building info AND the Landlord info inside it
      .populate({
        path: 'propertyId',
        select: 'title address landlordId',
        populate: { path: 'landlordId', select: 'name' }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(apartments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. UPDATE APARTMENT
router.put('/:id', async (req, res) => {
  try {
    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedApartment);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;