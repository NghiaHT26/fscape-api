const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const User = require('../models/user.model');
const { AuthProvider } = require('../models/authProvider.model');
const { ROLES, ADMIN_MANAGEABLE_ROLES } = require('../constants/roles');

class AdminUserService {

  // =========================
  // CREATE INTERNAL USER
  // =========================
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
  // GET USERS (role-scoped)
  // =========================
  static async getUsers(caller, { page = 1, limit = 10, search, role, is_active } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    if (caller.role === ROLES.ADMIN) {
      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: [
          'id', 'email', 'role', 'first_name', 'last_name',
          'phone', 'avatar_url', 'building_id', 'is_active',
          'created_at', 'last_login_at',
        ],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset,
      });

      return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows,
      };
    }

    if (caller.role === ROLES.BUILDING_MANAGER) {
      if (!caller.building_id) {
        throw new Error('Building manager is not assigned to any building');
      }

      where.building_id = caller.building_id;

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: [
          'id', 'email', 'role', 'first_name', 'last_name',
          'phone', 'avatar_url', 'is_active',
        ],
        order: [['created_at', 'DESC']],
        limit: Number(limit),
        offset,
      });

      return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows,
      };
    }

    throw new Error('Permission denied');
  }

  // =========================
  // UPDATE USER STATUS
  // =========================
  static async updateUserStatus(userId, isActive) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === ROLES.ADMIN) {
      throw new Error('Cannot change admin account status');
    }

    user.is_active = isActive;
    await user.save();

    return user;
  }
}

module.exports = AdminUserService;
