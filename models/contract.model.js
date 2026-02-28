const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Room = require('./room.model');
const ContractTemplate = require('./contractTemplate.model');

const Contract = sequelize.define('Contract', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true, 
    defaultValue: DataTypes.UUIDV4 
  },

  contract_number: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true // Mã hợp đồng tự sinh
  },

  template_id: { 
    type: DataTypes.UUID, 
    allowNull: true 
  },

  room_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },

  customer_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  }, // Bên thuê

  manager_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },  // Bên cho thuê (Auto-assign)
  
  term_type: { 
    type: DataTypes.ENUM('FIXED_TERM', 'INDEFINITE'), 
    defaultValue: 'FIXED_TERM' 
  },

  start_date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },

  end_date: { 
    type: DataTypes.DATEONLY, 
    allowNull: true 
  }, // NULL nếu là INDEFINITE
  
  base_rent: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },

  deposit_amount: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  
  billing_cycle: { 
    type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'), 
    defaultValue: 'MONTHLY'
  },
  
  status: {
    type: DataTypes.ENUM(
      'DRAFT', 'PENDING_CUSTOMER_SIGNATURE', 'PENDING_MANAGER_SIGNATURE', 
      'ACTIVE', 'EXPIRING_SOON', 'FINISHED', 'TERMINATED'
    ),
    defaultValue: 'DRAFT'
  },
  
  customer_signature_url: { 
    type: DataTypes.TEXT }, // Ảnh PNG chữ ký

  manager_signature_url: { 
    type: DataTypes.TEXT 
  },

  rendered_content: { 
    type: DataTypes.TEXT 
  },// Snapshot HTML lúc ký

  pdf_url: { 
    type: DataTypes.TEXT 
  },// File PDF cuối cùng
  
  next_billing_date: { 
    type: DataTypes.DATEONLY 
  },
  
  last_billed_date: { 
    type: DataTypes.DATEONLY 
  }
}, {
  tableName: 'contracts',
  timestamps: true,
  underscored: true
});

/* ===== RELATIONS ===== */
Contract.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Contract.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Contract.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
Contract.belongsTo(ContractTemplate, { foreignKey: 'template_id', as: 'template' });

module.exports = Contract;