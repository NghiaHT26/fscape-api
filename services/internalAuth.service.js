const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AuthProvider } = require("../models/authProvider.model");
const { INTERNAL_LOGIN_ROLES } = require("../constants/auth");

class InternalAuthService {
  // ========= LOGIN =========
  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!INTERNAL_LOGIN_ROLES.includes(user.role)) {
      throw new Error("This account must login via customer flow");
    }

    if (!user.is_active) {
      throw new Error("Account is inactive");
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

    const match = await bcrypt.compare(password, auth.password_hash);
    if (!match) {
      throw new Error("Invalid email or password");
    }

    await user.update({ last_login_at: new Date() });

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

    // 👉 Sau khi đổi: BẮT BUỘC hash lại
    const newHash = await bcrypt.hash(newPassword, 10);

    await auth.update({
      password_hash: newHash,
    });

    return true;
  }
}

module.exports = InternalAuthService;
