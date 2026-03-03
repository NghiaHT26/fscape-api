const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
  }, // Dành cho thanh toán hợp đồng

  booking_id: {
    type: DataTypes.UUID,
    allowNull: true
  }, // Dành cho thanh toán đặt cọc

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
    type: DataTypes.STRING(50),
    defaultValue: 'PENDING' // PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUNDED
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

Payment.associate = (models) => {
  Payment.belongsTo(models.User, { foreignKey: 'user_id', as: 'payer' });
  Payment.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  Payment.belongsTo(models.Contract, { foreignKey: 'contract_id', as: 'contract' });
  Payment.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
};

module.exports = Payment;