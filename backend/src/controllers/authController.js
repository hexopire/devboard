const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, findUserById } = require('../db/userQueries');
const { signToken } = require('../utils/jwt');

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
    const token = signToken(newUser);

    return res.status(201).json({ success: true, data: { user: newUser, token } });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    return res.status(200).json({ success: true, data: { user: safeUser, token } });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Only reaches here after authMiddleware verified the JWT and set
// req.user = { id, role, iat, exp }. The id is trustworthy (came from a
// signature-verified token), unlike anything in req.body/req.params.
async function getMe(req, res) {
  try {
    const user = await findUserById(req.user.id);

    // Token can still be valid (not expired) even if the row was deleted
    // after it was issued — that's a 404 (resource gone), not a 401
    // (401 would wrongly imply the token itself is the problem).
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { register, login, getMe };
