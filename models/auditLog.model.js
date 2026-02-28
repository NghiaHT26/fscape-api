const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  user_role: {
    type: DataTypes.STRING(50), // Vai trò lúc thực hiện hành động
    allowNull: true
  },
  action: {
    type: DataTypes.ENUM(
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'SIGN',
      'APPROVE',
      'REJECT',
      'ASSIGN'
    ),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(100), // Tên bảng chịu tác động
    allowNull: false
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  old_value: {
    type: DataTypes.JSONB, // Dữ liệu trước khi sửa
    allowNull: true
  },
  new_value: {
    type: DataTypes.JSONB, // Dữ liệu sau khi sửa
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET, // Địa chỉ IP thực hiện
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

/* Relation */
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'performer' });

module.exports = AuditLog;