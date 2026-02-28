const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Building = require('./building.model');

const BuildingImage = sequelize.define('BuildingImage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  building_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'building_images',
  timestamps: true,
  underscored: true
});

/* Relations */
Building.hasMany(BuildingImage, { foreignKey: 'building_id', as: 'images', onDelete: 'CASCADE' });
BuildingImage.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });

module.exports = BuildingImage;