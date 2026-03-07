const User = require('../models/user.model');
const CustomerProfile = require('../models/customerProfile.model');

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
      'is_active',
      'createdAt',
      'updatedAt'
    ],
    include: [{
      model: CustomerProfile,
      as: 'profile',
      attributes: ['gender', 'date_of_birth', 'permanent_address', 'emergency_contact_name', 'emergency_contact_phone']
    }]
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