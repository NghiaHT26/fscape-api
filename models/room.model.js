const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  building_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  room_type_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  room_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  floor: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  thumbnail_url: DataTypes.TEXT,
  image_3d_url: DataTypes.TEXT,
  blueprint_url: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'OCCUPIED', 'LOCKED'),
    defaultValue: 'AVAILABLE'
  }
}, {
  tableName: 'rooms',
  timestamps: true,
  underscored: true
})

Room.associate = (models) => {

  Room.belongsTo(models.Building, {
    foreignKey: 'building_id',
    as: 'building'
  })

  Room.belongsTo(models.RoomType, {
    foreignKey: 'room_type_id',
    as: 'room_type'
  })

  Room.hasMany(models.RoomImage, {
    foreignKey: 'room_id',
    as: 'images',
    onDelete: 'CASCADE'
  })

  Room.hasMany(models.Asset, {
    foreignKey: 'current_room_id',
    as: 'assets'
  })
}

module.exports = Room