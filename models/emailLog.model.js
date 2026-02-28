const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const EmailTemplate = require('./emailTemplate.model');
const User = require('./user.model');

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
    type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'), 
    defaultValue: 'PENDING' 
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

/* ===== RELATIONS ===== */
EmailTemplate.hasMany(EmailLog, { foreignKey: 'template_id', as: 'logs' });
EmailLog.belongsTo(EmailTemplate, { foreignKey: 'template_id', as: 'template' });

User.hasMany(EmailLog, { foreignKey: 'user_id', as: 'emails' });
EmailLog.belongsTo(User, { foreignKey: 'user_id', as: 'recipient' });

module.exports = EmailLog;