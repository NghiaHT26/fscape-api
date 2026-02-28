const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Asset = require('./asset.model');
const User = require('./user.model');

const AssetHistory = sequelize.define('AssetHistory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  asset_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'assets', key: 'id' }
  },
  from_room_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  to_room_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  from_status: {
    type: DataTypes.ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE'),
    allowNull: false
  },
  to_status: {
    type: DataTypes.ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE'),
    allowNull: false
  },
  action: { 
    type: DataTypes.ENUM('INITIAL_CREATE', 'UPDATE_INFO', 'CHECK_IN', 'CHECK_OUT', 'MAINTENANCE_START', 'MAINTENANCE_END'),
    allowNull: false
  },
  performed_by: {
    type: DataTypes.UUID,
    allowNull: true, // ID của Staff thực hiện quét mã
    references: { model: 'users', key: 'id' }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'asset_history',
  timestamps: true,
  updatedAt: false, // Bảng lịch sử thường không cần updated_at
  underscored: true
});

/* Relations */
Asset.hasMany(AssetHistory, { foreignKey: 'asset_id', as: 'histories', onDelete: 'CASCADE' });
AssetHistory.belongsTo(Asset, { foreignKey: 'asset_id' });
AssetHistory.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

module.exports = AssetHistory;