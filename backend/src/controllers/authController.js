const bcrypt = require('bcrypt');
const { createUser, findUserByEmail, findUserById } = require('../db/userQueries');
const { signToken } = require('../utils/jwt');
const { asyncHandler } = require('../utils/asyncHandler');

// Shape/format checks (required, email format, password length, role enum)
// now live in routes/auth.js as express-validator chains, run by the
// `validate` middleware before this function is even called. Only the
// checks that need a DB round-trip stay here — express-validator COULD do
// this too via a .custom() async validator, but that would mean a route
// file quietly making DB queries, which reads oddly compared to a
// controller doing it.
//
// No try/catch anywhere below — asyncHandler (applied at module.exports)
// catches any rejection from the whole function body and forwards it to
// errorHandler.js. Notably, `findUserByEmail` here used to run OUTSIDE the
// old try/catch block (a real pre-existing bug: if that query had thrown,
// it would've been an unhandled rejection, not a clean 500). asyncHandler
// fixes that automatically — it wraps the entire function, not just a
// hand-picked block inside it.
async function register(req, res) {
  const { name, email, password, role } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
  }

  const saltRounds = 10; // You can adjust this value based on your security needs
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = await createUser({ name, email, passwordHash, role: role || 'member' });
  const token = signToken(newUser);

  return res.status(201).json({ success: true, data: { user: newUser, token } });
}

async function login(req, res) {
  const { email, password } = req.body;

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
}

// Only reaches here after authMiddleware verified the JWT and set
// req.user = { id, role, iat, exp }. The id is trustworthy (came from a
// signature-verified token), unlike anything in req.body/req.params.
async function getMe(req, res) {
  const user = await findUserById(req.user.id);

  // Token can still be valid (not expired) even if the row was deleted
  // after it was issued — that's a 404 (resource gone), not a 401
  // (401 would wrongly imply the token itself is the problem).
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.status(200).json({ success: true, data: { user } });
}

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  getMe: asyncHandler(getMe),
};
