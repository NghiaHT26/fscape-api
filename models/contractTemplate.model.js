const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContractTemplate = sequelize.define('ContractTemplate', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },

  name: { 
    type: DataTypes.STRING(255), 
    allowNull: false 
  },

  version: { 
    type: DataTypes.STRING(20), 
    allowNull: false 
  },

  content: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  }, // HTML template

  variables: { 
    type: DataTypes.JSONB, 
    defaultValue: [] // Danh sách các placeholder hỗ trợ
  },

  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },

  is_default: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  
  created_by: { 
    type: DataTypes.UUID, 
    allowNull: true 
  }
}, {
  tableName: 'contract_templates',
  timestamps: true,
  underscored: true
});

module.exports = ContractTemplate;