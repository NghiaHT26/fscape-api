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
    let user = await User.findOne({ where: { email } });
    let authProvider = null;

    if (user) {
      authProvider = await AuthProvider.findOne({
        where: { user_id: user.id, provider: 'EMAIL' }
      });

      if (authProvider && authProvider.is_verified) {
        throw new Error('Email already exists and is verified');
      }
    } else {
      user = await User.create({
        email,
        role: 'CUSTOMER',
      });
    }

    const hashedPassword = await hashPassword(password);

    if (authProvider) {
      authProvider.password_hash = hashedPassword;
      await authProvider.save();
    } else {
      await AuthProvider.create({
        user_id: user.id,
        provider: 'EMAIL',
        provider_id: email,
        password_hash: hashedPassword,
        is_verified: false,
      });
    }

    const otp = await generateOtp(email, 'EMAIL_VERIFICATION');
    await sendOtpMail(email, otp.code);

    return { message: 'OTP sent to email. Please verify to complete registration.' };
  }

  // STEP 2: verify OTP + activate user
  static async verifySignup(email, otp) {
    await verifyOtp(email, otp, 'EMAIL_VERIFICATION');

    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    const authProvider = await AuthProvider.findOne({
      where: { user_id: user.id, provider: 'EMAIL' }
    });

    if (!authProvider) throw new Error('Auth provider not found');
    if (authProvider.is_verified) throw new Error('User is already verified');

    authProvider.is_verified = true;
    await authProvider.save();

    return user;
  }

  static async signin(email, password) {
    const auth = await AuthProvider.findOne({
      where: { provider: 'EMAIL', provider_id: email },
      include: [User],
    });

    if (!auth || !auth.is_verified)
      throw new Error('Invalid credentials');

    const match = await comparePassword(password, auth.password_hash);
    if (!match) throw new Error('Invalid credentials');

    return {
      access_token: generateAccessToken(auth.User),
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