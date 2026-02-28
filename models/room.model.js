const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Building = require('./building.model');
const RoomType = require('./roomType.model');

const Room = sequelize.define('Room', {
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
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'room_types', key: 'id' }
  },
  room_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  floor: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_3d_url: { // Đồng bộ tên trường theo thiết kế
    type: DataTypes.TEXT,
    allowNull: true
  },
  blueprint_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'OCCUPIED', 'LOCKED'),
    defaultValue: 'AVAILABLE'
  }
}, {
  tableName: 'rooms', // Chuyển thành số nhiều
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['building_id', 'room_number']
    },
    { fields: ['status'] },
    { fields: ['floor'] }
  ]
});

/* ===== RELATIONS ===== */
Room.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Building.hasMany(Room, { foreignKey: 'building_id', as: 'rooms' });

Room.belongsTo(RoomType, { foreignKey: 'room_type_id', as: 'room_type' });
RoomType.hasMany(Room, { foreignKey: 'room_type_id', as: 'rooms' });

module.exports = Room;