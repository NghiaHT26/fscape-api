const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const serviceType = sequelize.define(
  'ServiceType',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'service_types',
    underscored: true,
    timestamps: false
  }
);

module.exports = serviceType;