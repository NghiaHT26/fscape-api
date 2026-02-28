const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// const Location = require('./location.model');

const University = sequelize.define(
  'University',
  {
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
      allowNull: false,
      unique: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'universities',
    timestamps: true,
    underscored: true
  }
);

University.associate = (models) => {
  University.belongsTo(models.Location, {
    foreignKey: 'location_id',
    as: 'location'
  });
};

module.exports = University;