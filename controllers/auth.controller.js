const AuthService = require('../services/auth.service');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.signup(email, password);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await AuthService.verifySignup(email, otp);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const token = await AuthService.signin(req.body.email, req.body.password);
    res.json(token);
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await AuthService.forgotPassword(req.body.email);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    const result = await AuthService.resetPassword(email, otp, new_password);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};