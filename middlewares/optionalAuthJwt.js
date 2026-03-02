const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async function optionalAuthJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);

    if (user && user.is_active) {
      req.user = { id: user.id, role: user.role };
    }
  } catch (_err) {
    // Invalid token — treat as unauthenticated
  }

  next();
};
