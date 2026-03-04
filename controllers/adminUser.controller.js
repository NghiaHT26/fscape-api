const AdminUserService = require('../services/adminUser.service');

exports.createUser = async (req, res) => {
  try {
    const user = await AdminUserService.createInternalUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await AdminUserService.getUsers(req.user, req.query);
    return res.json({ data: users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        message: 'is_active must be boolean',
      });
    }

    const user = await AdminUserService.updateUserStatus(id, is_active);

    return res.json({
      message: 'User status updated',
      data: {
        id: user.id,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
