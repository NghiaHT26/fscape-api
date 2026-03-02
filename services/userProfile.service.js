const User = require('../models/user.model');

const getProfileById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'email',
      'role',
      'first_name',
      'last_name',
      'phone',
      'avatar_url',
      'building_id',
    ]
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
};

const updateProfileById = async (userId, payload) => {
  const allowedFields = [
    'first_name',
    'last_name',
    'phone',
    'avatar_url'
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  await user.update(updateData);
  return user;
};

module.exports = {
  getProfileById,
  updateProfileById
};