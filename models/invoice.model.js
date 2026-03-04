const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Contract = require('./contract.model');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },

  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  contract_id: {
    type: DataTypes.UUID,
    allowNull: false
  },

  billing_period_start: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  billing_period_end: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  room_rent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  service_fees: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  penalty_fees: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  refund_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED'),
    defaultValue: 'UNPAID'
  },

  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  paid_at: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['invoice_number'] }, { fields: ['status'] }]
});

/* Relations */
Invoice.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });
Contract.hasMany(Invoice, { foreignKey: 'contract_id', as: 'invoices' });

module.exports = Invoice;