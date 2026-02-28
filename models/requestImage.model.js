const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Request = require('./request.model');
const User = require('./user.model');

const RequestImage = sequelize.define('RequestImage', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'requests', key: 'id' }
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'attachment', // 'attachment' (Resident) hoặc 'completion' (Staff)
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'request_images',
  timestamps: true,
  updatedAt: false, // Ảnh đã upload không cần sửa
  underscored: true
});

/* ===== RELATIONS ===== */
Request.hasMany(RequestImage, { foreignKey: 'request_id', as: 'images', onDelete: 'CASCADE' });
RequestImage.belongsTo(Request, { foreignKey: 'request_id' });
RequestImage.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

module.exports = RequestImage;