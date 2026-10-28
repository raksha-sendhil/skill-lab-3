const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sendToken(res, user, status = 200) {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  res.status(status).json({ token, user });
}

router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, city } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (await User.exists({ email: cleanEmail })) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({
    name,
    email: cleanEmail,
    password: await bcrypt.hash(String(password), 10),
    role,
    phone,
    city,
  });
  sendToken(res, user, 201);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = email && (await User.findOne({ email: String(email).trim().toLowerCase() }));

  if (!user || !(await bcrypt.compare(String(password || ''), user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  sendToken(res, user);
});

module.exports = router;
