const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../db/userQueries');

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'name, email, and password are required' });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
  }
  
  try {
    const saltRounds = 10; // You can adjust this value based on your security needs
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ name, email, passwordHash, role: role || 'member' });

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { register };
