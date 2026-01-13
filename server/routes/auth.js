const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword
    });

    const savedAgent = await newAgent.save();
    res.status(201).json(savedAgent);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const agent = await Agent.findOne({ email: req.body.email });
    if (!agent) return res.status(404).json({message : "Agent not found"});

    const validPassword = await bcrypt.compare(req.body.password, agent.password);
    if (!validPassword) return res.status(400).json({message :"Wrong password"});

    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    // Return token and agent info 
    const { password, ...others } = agent._doc;
    res.status(200).json({ ...others, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// UPDATE PROFILE & SETTINGS
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, email, reminderSettings } = req.body;
    
    // Validate inputs if needed...

    const updatedAgent = await Agent.findByIdAndUpdate(userId, {
      name,
      email,
      reminderSettings // Expecting an array like [90, 30, 7]
    }, { new: true });

    // Return new info without password
    const { password, ...others } = updatedAgent._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;