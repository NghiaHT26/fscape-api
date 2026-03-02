const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RequestImage = sequelize.define('RequestImage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_type: {
    type: DataTypes.ENUM('ATTACHMENT', 'COMPLETION'),
    defaultValue: 'ATTACHMENT',
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'request_images',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

/* ===== RELATIONS ===== */
RequestImage.associate = (models) => {
  RequestImage.belongsTo(models.Request, { foreignKey: 'request_id', as: 'request' });
  RequestImage.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
};

module.exports = RequestImage;