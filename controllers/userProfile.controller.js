const userService = require('../services/userProfile.service');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.getProfileById(userId);

    res.json({
      data: user
    });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userService.updateProfileById(userId, req.body);

    res.json({
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(500).json({ message: error.message });
  }
};