const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CustomerProfile = sequelize.define('CustomerProfile', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20), // MALE, FEMALE, OTHER
    allowNull: true
  },
  permanent_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'customer_profiles',
  timestamps: true,
  underscored: true
});

CustomerProfile.associate = (models) => {
  CustomerProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

module.exports = CustomerProfile;