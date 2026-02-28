const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Building = require('./building.model');
const Facility = require('./facility.model');

const BuildingFacility = sequelize.define('BuildingFacility', {
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
  facility_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'facilities', key: 'id' }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'building_facilities',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['building_id', 'facility_id']
    }
  ]
});

/* ===== RELATIONS (Many-to-Many) ===== */
Building.belongsToMany(Facility, { 
  through: BuildingFacility, 
  foreignKey: 'building_id', 
  otherKey: 'facility_id',
  as: 'facilities' 
});

Facility.belongsToMany(Building, { 
  through: BuildingFacility, 
  foreignKey: 'facility_id', 
  otherKey: 'building_id',
  as: 'buildings' 
});

BuildingFacility.belongsTo(Building, { foreignKey: 'building_id' });
BuildingFacility.belongsTo(Facility, { foreignKey: 'facility_id' });

module.exports = BuildingFacility;