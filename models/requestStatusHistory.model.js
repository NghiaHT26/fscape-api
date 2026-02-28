const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Request = require('./request.model');
const User = require('./user.model');

const RequestStatusHistory = sequelize.define('RequestStatusHistory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'requests', key: 'id' }
  },
  from_status: {
    type: DataTypes.STRING(50), // request_status cũ
    allowNull: true
  },
  to_status: {
    type: DataTypes.STRING(50), // request_status mới
    allowNull: false
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'request_status_history',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

/* ===== RELATIONS ===== */
Request.hasMany(RequestStatusHistory, { foreignKey: 'request_id', as: 'status_history' });
RequestStatusHistory.belongsTo(Request, { foreignKey: 'request_id' });
RequestStatusHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'modifier' });

module.exports = RequestStatusHistory;