const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// const Building = require('./building.model');

const BuildingImage = sequelize.define('BuildingImage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  building_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'buildings',
      key: 'id' 
    }
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'building_images',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

BuildingImage.associate = (models) => {
  BuildingImage.belongsTo(models.Building, { 
    foreignKey: 'building_id', 
    as: 'building' 
  });
};

module.exports = BuildingImage;