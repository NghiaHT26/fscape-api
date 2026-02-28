const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  
  template_key: { 
    type: DataTypes.STRING(100), 
    allowNull: false, 
    unique: true // Ví dụ: 'WELCOME_EMAIL', 'INVOICE_REMINDER'
  },
  
  name: { 
    type: DataTypes.STRING(255), 
    allowNull: false // Tên gợi nhớ cho Admin
  },
  
  subject: { 
    type: DataTypes.STRING(255), 
    allowNull: false // Tiêu đề Email
  },
  
  body_html: { 
    type: DataTypes.TEXT, 
    allowNull: false // Nội dung HTML của Email
  },
  
  variables: { 
    type: DataTypes.JSONB, 
    defaultValue: [], // Danh sách các biến được phép sử dụng trong template
    allowNull: true 
  },
  
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  
  description: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
}, {
  tableName: 'email_templates',
  timestamps: true,
  underscored: true
});

module.exports = EmailTemplate;