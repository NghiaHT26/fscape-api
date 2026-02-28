const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const User = require('../models/user.model');
const { AuthProvider } = require('../models/authProvider.model');
const { ADMIN_MANAGEABLE_ROLES } = require('../constants/roles');

class AdminUserService {

  // =========================
  // CREATE INTERNAL USER
  // =========================
  static async createInternalUser(payload, req) {
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

    const user = await sequelize.transaction(async (t) => {
      const createdUser = await User.create(
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
          user_id: createdUser.id,
          provider: 'EMAIL',
          provider_id: email,
          password_hash: passwordHash,
          is_verified: true,
        },
        { transaction: t }
      );

      return createdUser;
    });
    return user;
  }

  // =========================
  // GET ALL USERS (NO AUDIT)
  // =========================
  static async getAllUsers() {
    return User.findAll({
      attributes: [
        'id',
        'email',
        'role',
        'first_name',
        'last_name',
        'phone',
        'is_active',
        'created_at',
        'last_login_at'
      ],
      order: [['created_at', 'DESC']]
    });
  }

  // =========================
  // UPDATE USER STATUS
  // =========================
  static async updateUserStatus(userId, isActive, req) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new Error('Cannot deactivate admin account');
    }

    const oldStatus = user.is_active;

    user.is_active = isActive;
    await user.save();

    // 🔍 AUDIT LOG – UPDATE STATUS
    await AuditLogger.log({
      ctx: req.audit,
      action: AUDIT_ACTION.UPDATE,
      entityType: 'users',
      entityId: user.id,
      oldValue: { is_active: oldStatus },
      newValue: { is_active: isActive }
    });

    return user;
  }
}

module.exports = AdminUserService;