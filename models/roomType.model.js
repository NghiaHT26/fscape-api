const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RoomType = sequelize.define('RoomType', {
  id: { 
    type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 
  },
  name: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT,
    allowNull: true
  },
  base_price: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  deposit_months: { 
    type: DataTypes.SMALLINT, 
    defaultValue: 1 
  },
  capacity_min: { 
    type: DataTypes.SMALLINT, 
    defaultValue: 1 
  },
  capacity_max: { 
    type: DataTypes.SMALLINT, 
    defaultValue: 1 
  },
  bedrooms: { 
    type: DataTypes.SMALLINT, 
    defaultValue: 1 
  },
  bathrooms: {
     type: DataTypes.SMALLINT, 
     defaultValue: 1 
    },
  area_sqm: { 
    type: DataTypes.DECIMAL(6, 2) }, // Diện tích m2
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true }
}, {
  tableName: 'room_types',
  timestamps: true,
  underscored: true
});

module.exports = RoomType;