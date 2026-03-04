const { ROLES } = require('../constants/roles');

module.exports = function requireCustomer(req, res, next) {
  console.log('req.user =', req.user);
  if (!req.user || req.user.role !== ROLES.CUSTOMER) {
    return res.status(403).json({
      message: 'Customer permission required',
    });
  }
  next();
};