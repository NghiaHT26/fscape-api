const AdminUserService = require('../services/adminUser.service');

exports.createUser = async (req, res) => {
  try {
    const user = await AdminUserService.createInternalUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await AdminUserService.updateUser(
      req.params.id,
      req.body
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const user = await AdminUserService.deactivateUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listUsers = async (req, res) => {
  const users = await AdminUserService.listUsers();
  res.json(users);
};