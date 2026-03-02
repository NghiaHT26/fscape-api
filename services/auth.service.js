const User = require('../models/user.model');
const { AuthProvider } = require('../models/authProvider.model');
const { generateOtp, verifyOtp } = require('../utils/otp.util');
const {
  hashPassword,
  comparePassword,
} = require('../utils/password.util');
const { sendOtpMail } = require('../utils/mail.util');
const { generateAccessToken } = require('../utils/token.util');

class AuthService {
  // STEP 1: signup -> send OTP
  static async signup(email, password) {
    const existed = await User.findOne({ where: { email } });
    if (existed) throw new Error('Email already exists');

    const otp = await generateOtp(email, 'EMAIL_VERIFICATION');
    await sendOtpMail(email, otp.code);

    return { message: 'OTP sent to email' };
  }

  // STEP 2: verify OTP + create user
  static async verifySignup(email, password, otp) {
    await verifyOtp(email, otp, 'EMAIL_VERIFICATION');

    const user = await User.create({
      email,
      role: 'CUSTOMER',
    });

    await AuthProvider.create({
      user_id: user.id,
      provider: 'EMAIL',
      provider_id: email,
      password_hash: await hashPassword(password),
      is_verified: true,
    });

    return user;
  }

  static async signin(email, password) {
  const auth = await AuthProvider.findOne({
    where: { provider: 'EMAIL', provider_id: email },
    include: [
      {
        model: User,
        attributes: [
          'id',
          'email',
          'role',
          'first_name',
          'last_name',
          'phone',
          'avatar_url',
          'building_id',
          'is_active',
          'last_login_at',
          'created_at',
        ],
      },
    ],
  });

  if (!auth || !auth.is_verified)
    throw new Error('Invalid credentials');
  if (!auth.User || auth.User.is_active === false)
    throw new Error('User account is deactivated');
  const match = await comparePassword(password, auth.password_hash);
  if (!match) throw new Error('Invalid credentials');

  await auth.User.update({ last_login_at: new Date() });

  return {
    access_token: generateAccessToken(auth.User),
    user: auth.User, //return user data
  };
}

  static async forgotPassword(email) {
    const otp = await generateOtp(email, 'PASSWORD_RESET');
    await sendOtpMail(email, otp.code);
    return { message: 'OTP sent' };
  }

  static async resetPassword(email, otp, newPassword) {
    await verifyOtp(email, otp, 'PASSWORD_RESET');

    const auth = await AuthProvider.findOne({
      where: { provider: 'EMAIL', provider_id: email }
    });

    if (!auth) throw new Error('Account not found');

    auth.password_hash = await hashPassword(newPassword);
    await auth.save();

    return { message: 'Password updated' };
  }
}

module.exports = AuthService;