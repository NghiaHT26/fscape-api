const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
  updatedAt: false, 
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['building_id', 'facility_id']
    }
  ]
});

BuildingFacility.associate = (models) => {
  BuildingFacility.belongsTo(models.Building, { foreignKey: 'building_id' });
  BuildingFacility.belongsTo(models.Facility, { foreignKey: 'facility_id' });
};

module.exports = BuildingFacility;