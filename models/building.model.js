const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Location = require('./location.model');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  location_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  total_floors: {
    type: DataTypes.SMALLINT
  },
  thumbnail_url: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'buildings',
  timestamps: true,
  underscored: true
});

/* Relations */
Building.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Location.hasMany(Building, { foreignKey: 'location_id', as: 'buildings' });

module.exports = Building;