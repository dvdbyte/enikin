const router = require('express').Router();
const Landlord = require('../models/Landlord');

// 1. CREATE LANDLORD
router.post('/', async (req, res) => {
  try {
    const newLandlord = new Landlord(req.body);
    const savedLandlord = await newLandlord.save();
    res.status(201).json(savedLandlord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create landlord', error: err.message });
  }
});

// 2. GET ALL LANDLORDS
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query; // removed stray "L"

    if (!agentId) return res.status(400).json({ message: "agentId query param is required" });

    const landlords = await Landlord.find({ agentId }).sort({ createdAt: -1 });
    res.status(200).json(landlords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch landlords', error: err.message });
  }
});

// 3. UPDATE LANDLORD
router.put('/:id', async (req, res) => {
  try {
    const updatedLandlord = await Landlord.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedLandlord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update landlord', error: err.message });
  }
});

module.exports = router;
