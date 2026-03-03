const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    type: DataTypes.STRING(50),
    defaultValue: 'UNPAID' // UNPAID, PAID, OVERDUE, CANCELLED
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

Invoice.associate = (models) => {
  Invoice.belongsTo(models.Contract, { foreignKey: 'contract_id', as: 'contract' });
  Invoice.hasMany(models.Payment, { foreignKey: 'invoice_id', as: 'payments' });
};

module.exports = Invoice;