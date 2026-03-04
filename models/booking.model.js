const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./room.model');
const User = require('./user.model');
const Contract = require('./contract.model');
const Payment = require('./payment.model');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  booking_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  check_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: { 
    type: DataTypes.ENUM('PENDING', 'DEPOSIT_PAID', 'CONVERTED', 'CANCELLED'), 
    defaultValue: 'PENDING' 
  },
  room_price_snapshot: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false // Lưu giá tại thời điểm đặt
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  deposit_payment_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  deposit_paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  contract_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  converted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true
});

/* ===== RELATIONS ===== */
Booking.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Booking.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });
Booking.belongsTo(Payment, { foreignKey: 'deposit_payment_id', as: 'payment' });

module.exports = Booking;