const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ScheduledJob = sequelize.define('ScheduledJob', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  job_name: { type: DataTypes.STRING(100), allowNull: false },
  job_type: { 
    type: DataTypes.STRING(50), 
    allowNull: false // 'BILLING', 'CONTRACT_EXPIRY', 'INVOICE_REMINDER'
  },
  status: { type: DataTypes.STRING(20), defaultValue: 'PENDING' },
  started_at: { type: DataTypes.DATE },
  completed_at: { type: DataTypes.DATE },
  records_processed: { type: DataTypes.INTEGER, defaultValue: 0 },
  error_message: { type: DataTypes.TEXT }
}, {
  tableName: 'scheduled_jobs',
  timestamps: true,
  underscored: true
});

module.exports = ScheduledJob;