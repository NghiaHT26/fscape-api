const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const PROVIDER_TYPE = ['EMAIL', 'GOOGLE'];

const AuthProvider = sequelize.define(
  "AuthProvider",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },

    provider: {
      type: DataTypes.STRING(50), // EMAIL, GOOGLE
      allowNull: false,
    },

    provider_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "auth_providers",
    underscored: true,
    timestamps: true,
  }
);
AuthProvider.associate = (models) => {
  AuthProvider.belongsTo(models.User, { foreignKey: 'user_id' });
};
module.exports = { AuthProvider, PROVIDER_TYPE };