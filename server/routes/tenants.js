const router = require('express').Router();
const multer = require('multer');
const Tenant = require('../models/Tenant');

const { uploadToCloudinary } = require('../utils/cloudinary'); 

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new Tenant with Image AND Agent ID
router.post('/', upload.single('passport'), async (req, res) => {
  try {
    const { name, email, phone, address, agentId } = req.body;
    let passportUrl = "";

    // Upload to Cloudinary if file exists
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      passportUrl = result.secure_url;
    }

    const newTenant = new Tenant({
      name,
      email,
      phone,
      address,
      passportUrl,
      agentId 
    });

    const savedTenant = await newTenant.save();
    res.status(201).json(savedTenant);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// Get Tenants 
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query; 

    const tenants = await Tenant.find({ agentId }).sort({ createdAt: -1 });
    
    res.status(200).json(tenants);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE TENANT
router.put('/:id', upload.single('passport'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      
      const result = await uploadToCloudinary(req.file.buffer);
      updates.passportUrl = result.secure_url;
    }
    
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    res.status(200).json(updatedTenant);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;