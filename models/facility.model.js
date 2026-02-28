const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Facility = sequelize.define('Facility', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'facilities',
  timestamps: true,
  underscored: true
});

module.exports = Facility;