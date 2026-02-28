const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const User = require('../models/user.model');
const { AuthProvider } = require('../models/authProvider.model');
const { ADMIN_MANAGEABLE_ROLES } = require('../constants/roles');

class AdminUserService {
  static async createInternalUser(payload) {
    const {
      email,
      password,
      role,
      first_name,
      last_name,
      phone,
      building_id,
    } = payload;

    if (!ADMIN_MANAGEABLE_ROLES.includes(role)) {
      throw new Error('Role is not allowed to be created by admin');
    }

    const existed = await User.findOne({ where: { email } });
    if (existed) {
      throw new Error('Email already exists');
    }

    return sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          email,
          role,
          first_name,
          last_name,
          phone,
          building_id,
          is_active: true,
        },
        { transaction: t }
      );

      const passwordHash = await bcrypt.hash(password, 10);

      await AuthProvider.create(
        {
          user_id: user.id,
          provider: 'EMAIL',
          provider_id: email,
          password_hash: passwordHash,
          is_verified: true,
        },
        { transaction: t }
      );

      return user;
    });
  }

  static async updateUser(userId, payload) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!ADMIN_MANAGEABLE_ROLES.includes(user.role)) {
      throw new Error('Cannot update this role');
    }

    await user.update(payload);
    return user;
  }

  static async deactivateUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (!ADMIN_MANAGEABLE_ROLES.includes(user.role)) {
      throw new Error('Cannot deactivate this role');
    }

    user.is_active = false;
    await user.save();
    return user;
  }

  static async listUsers() {
    return User.findAll({
      where: {
        role: ADMIN_MANAGEABLE_ROLES,
      },
      order: [['created_at', 'DESC']],
    });
  }
}

module.exports = AdminUserService;