const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const ServiceType = require('./serviceType.model');

const Service = sequelize.define(
  'Service',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    service_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_types',
        key: 'id',
      },
    },

    contact_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    staff_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'service',
    underscored: true,
    timestamps: true, // created_at, updated_at
  }
);

module.exports = Service;