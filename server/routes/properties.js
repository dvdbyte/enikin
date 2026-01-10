const router = require('express').Router();
const Property = require('../models/Property');
const Apartment = require('../models/Apartment');

// 1. CREATE BUILDING
router.post('/', async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET ALL BUILDINGS 
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query;
    const properties = await Property.find({ agentId })
      .populate('landlordId') 
      .sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. UPDATE BUILDING 
router.put('/:id', async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProperty);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. GET BUILDING STATS 

module.exports = router;