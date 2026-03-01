const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { INTERNAL_LOGIN_ROLES } = require('../constants/auth');

module.exports = async function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // chỉ cho role nội bộ
    if (!INTERNAL_LOGIN_ROLES.includes(user.role)) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: 'Account is inactive',
      });
    }

    // attach user vào request
    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};