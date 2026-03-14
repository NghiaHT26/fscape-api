const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AuthProvider } = require("../models/authProvider.model");
const { INTERNAL_LOGIN_ROLES } = require("../constants/auth");

class InternalAuthService {
  // ========= LOGIN =========
  static async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Email not found");
    }

    if (!INTERNAL_LOGIN_ROLES.includes(user.role)) {
      throw new Error("This account is not allowed to login here. Please use customer login");
    }

    if (!user.is_active) {
      throw new Error("Account is inactive. Please contact administrator");
    }

    const auth = await AuthProvider.findOne({
      where: {
        user_id: user.id,
        provider: "EMAIL",
      },
    });

    if (!auth || !auth.password_hash) {
      throw new Error("No password set for this account. Please contact administrator");
    }

    const match = await bcrypt.compare(password, auth.password_hash);
    if (!match) {
      throw new Error("Incorrect password");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        building_id: user.building_id,
      },
    };
  }

  // ========= CHANGE PASSWORD =========
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!INTERNAL_LOGIN_ROLES.includes(user.role)) {
      throw new Error("This account cannot change password here");
    }

    const auth = await AuthProvider.findOne({
      where: {
        user_id: user.id,
        provider: "EMAIL",
      },
    });

    if (!auth || !auth.password_hash) {
      throw new Error("Invalid authentication method");
    }

    const match = await bcrypt.compare(oldPassword, auth.password_hash);
    if (!match) {
      throw new Error("Old password is incorrect");
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await auth.update({
      password_hash: newHash,
    });

    return true;
  }

  // ========= CREATE ADMIN =========
  static async createAdmin({ email, password, first_name, last_name, phone }) {
      if (!email || !password || !first_name || !last_name || !phone) {
        throw new Error("email, password, first_name, last_name, and phone are required");
      }

      const existed = await User.findOne({ where: { email } });
      if (existed) {
        throw new Error("Email already exists");
      }

      const { sequelize } = require('../config/db');

      const result = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          { email, role: "ADMIN", first_name, last_name, phone, is_active: true },
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

      return {
        id: result.id,
        email: result.email,
        role: result.role,
        first_name: result.first_name,
        last_name: result.last_name,
        phone: result.phone,
      };
    }
  }

module.exports = InternalAuthService;
