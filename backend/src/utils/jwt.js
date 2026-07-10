const jwt = require('jsonwebtoken');

// Payload carries id + role only — enough to identify the user and check
// permissions without a DB hit, nothing sensitive (payload is base64, not encrypted).
function signToken(user) {
    const payload = {
        id: user.id,
        role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

module.exports = { signToken };
