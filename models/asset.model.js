const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  building_id: {
    type: DataTypes.UUID,
    allowNull: false
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
    type: DataTypes.STRING(50),
    defaultValue: 'AVAILABLE' // AVAILABLE, IN_USE, MAINTENANCE
  },
  current_room_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'assets',
  timestamps: true,
  underscored: true
})

Asset.associate = (models) => {

  /* Asset <-> Building */
  Asset.belongsTo(models.Building, {
    foreignKey: 'building_id',
    as: 'building'
  })
  models.Building.hasMany(Asset, {
    foreignKey: 'building_id',
    as: 'assets'
  })

  /* Asset <-> Room */
  Asset.belongsTo(models.Room, {
    foreignKey: 'current_room_id',
    as: 'room'
  })
}

module.exports = Asset