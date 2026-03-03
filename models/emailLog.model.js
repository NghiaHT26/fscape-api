const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },

  template_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'email_templates', key: 'id' }
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' } // Người nhận (nếu có trong hệ thống)
  },

  recipient_email: {
    type: DataTypes.STRING(255),
    allowNull: false // Địa chỉ Email thực tế lúc gửi
  },

  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PENDING' // PENDING, SENT, FAILED
  },

  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  error_message: {
    type: DataTypes.TEXT,
    allowNull: true // Lưu lý do nếu gửi thất bại
  },

  context_data: {
    type: DataTypes.JSONB,
    allowNull: true // Lưu lại dữ liệu biến đã dùng để render Email lúc đó
  }
}, {
  tableName: 'email_logs',
  timestamps: true,
  updatedAt: false, // Nhật ký gửi thư không cần sửa đổi
  underscored: true
});

EmailLog.associate = (models) => {
  EmailLog.belongsTo(models.EmailTemplate, { foreignKey: 'template_id', as: 'template' });
  EmailLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'recipient' });
};

module.exports = EmailLog;