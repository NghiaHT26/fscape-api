const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./room.model');

const RoomImage = sequelize.define('RoomImage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'room_images',
  timestamps: true,
  underscored: true
});

/* Relation */
Room.hasMany(RoomImage, { foreignKey: 'room_id', as: 'images', onDelete: 'CASCADE' });
RoomImage.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

module.exports = RoomImage;