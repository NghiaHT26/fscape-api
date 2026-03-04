const { ROLES } = require('../constants/roles');

module.exports = function requireResident(req, res, next) {
  console.log('req.user =', req.user);
  if (!req.user || req.user.role !== ROLES.RESIDENT) {
    return res.status(403).json({
      message: 'Resident permission required',
    });
  }
  next();
};