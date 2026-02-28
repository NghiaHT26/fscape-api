const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Invoice = require('./invoice.model');
const Contract = require('./contract.model');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },

  payment_number: {
    type: DataTypes.STRING(50),
    allowNull: false, unique: true
  },

  invoice_id: {
    type: DataTypes.UUID,
    allowNull: true
  },

  contract_id: {
    type: DataTypes.UUID,
    allowNull: true
  }, // Dành cho thanh toán cọc

  user_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },

  amount: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },

  payment_type: {
    type: DataTypes.STRING(50),
    allowNull: false // 'DEPOSIT', 'RENT', 'SERVICE'
  },

  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },

  gateway_transaction_id: { 
    type: DataTypes.STRING(255) 
  },

  gateway_response: { 
    type: DataTypes.JSONB 
  },

  paid_at: { 
    type: DataTypes.DATE 
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['payment_number'] }, { fields: ['status'] }]
});

/* Relations */
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'payer' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
Payment.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });

module.exports = Payment;