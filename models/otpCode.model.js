const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OTP_TYPES = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET'
};

const OtpCode = sequelize.define(
  "OtpCode",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),
      allowNull: false,
    },

    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otp_codes",
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = { OtpCode, OTP_TYPES };