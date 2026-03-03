const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  location_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'locations',
      key: 'id'
    }
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

Building.associate = (models) => {
  Building.belongsTo(models.Location, {
    foreignKey: 'location_id',
    as: 'location'
  });

  Building.hasMany(models.BuildingImage, {
    foreignKey: 'building_id',
    as: 'images'
  });

  Building.belongsToMany(models.Facility, {
    through: models.BuildingFacility,
    foreignKey: 'building_id',
    otherKey: 'facility_id',
    as: 'facilities'
  });

  Building.hasMany(models.Room, {
    foreignKey: 'building_id',
    as: 'rooms'
  });
};

module.exports = Building;