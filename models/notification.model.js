const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM('CONTRACT_PENDING', 'INVOICE_GENERATED', 'MAINTENANCE_REQUEST', 'GENERAL_ANNOUNCEMENT'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_type: { 
    type: DataTypes.ENUM('USER', 'ROOM', 'BUILDING', 'ALL'), 
    allowNull: false 
  },
  target_id: {
    type: DataTypes.UUID,
    allowNull: true // NULL nếu gửi cho 'ALL'
  },
  reference_type: {
    type: DataTypes.ENUM('CONTRACT', 'INVOICE', 'REQUEST'),
    allowNull: true
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = Notification;