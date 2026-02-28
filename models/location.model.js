const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'locations',
  timestamps: true,
  underscored: true
});

Location.associate = (models) => {
  Location.hasMany(models.Building, { 
    foreignKey: 'location_id', 
    as: 'buildings' 
  });

  Location.hasMany(models.University, { 
    foreignKey: 'location_id', 
    as: 'universities' 
  });
};

module.exports = Location;