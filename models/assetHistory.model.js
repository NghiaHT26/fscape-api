const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    type: DataTypes.STRING(50),
    allowNull: false // AVAILABLE, IN_USE, MAINTENANCE
  },
  to_status: {
    type: DataTypes.STRING(50),
    allowNull: false // AVAILABLE, IN_USE, MAINTENANCE
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false // INITIAL_CREATE, UPDATE_INFO, CHECK_IN, CHECK_OUT, MAINTENANCE_START, MAINTENANCE_END
  },
  performed_by: {
    type: DataTypes.UUID,
    allowNull: true // ID của Staff thực hiện quét mã
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

AssetHistory.associate = (models) => {
  AssetHistory.belongsTo(models.Asset, { foreignKey: 'asset_id', as: 'asset' });
  AssetHistory.belongsTo(models.User, { foreignKey: 'performed_by', as: 'performer' });
};

module.exports = AssetHistory;