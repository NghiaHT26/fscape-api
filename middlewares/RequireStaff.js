const { ROLES } = require('../constants/roles');

module.exports = function requireStaff(req, res, next) {
  console.log('req.user =', req.user);
  if (!req.user || req.user.role !== ROLES.STAFF) {
    return res.status(403).json({
      message: 'Staff permission required',
    });
  }
  next();
};