const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Building = require('./building.model');
const Room = require('./room.model');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  building_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'buildings', key: 'id' }
  },
  qr_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true 
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE'
  },
  current_room_id: {
    type: DataTypes.UUID,
    allowNull: true // NULL = Đang ở kho
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['qr_code'] },
    { fields: ['building_id'] },
    { fields: ['status'] },
    { fields: ['current_room_id'] }
  ]
});

/* ===== RELATIONS ===== */
Asset.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Building.hasMany(Asset, { foreignKey: 'building_id', as: 'assets' });

Asset.belongsTo(Room, { foreignKey: 'current_room_id', as: 'room' });
Room.hasMany(Asset, { foreignKey: 'current_room_id', as: 'assets' });

module.exports = Asset;