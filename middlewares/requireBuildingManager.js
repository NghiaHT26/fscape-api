const { ROLES } = require('../constants/roles');

module.exports = function requireBuildingManager(req, res, next) {
  console.log('req.user =', req.user);
  if (!req.user || req.user.role !== ROLES.BUILDING_MANAGER) {
    return res.status(403).json({
      message: 'Building Manager permission required',
    });
  }
  next();
};