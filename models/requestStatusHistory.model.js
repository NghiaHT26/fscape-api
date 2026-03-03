const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RequestStatusHistory = sequelize.define('RequestStatusHistory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  from_status: {
    type: DataTypes.STRING(50),
    allowNull: true // PENDING, ASSIGNED, PRICE_PROPOSED, APPROVED, IN_PROGRESS, DONE, COMPLETED, REVIEWED, REFUNDED, CANCELLED
  },
  to_status: {
    type: DataTypes.STRING(50),
    allowNull: false // PENDING, ASSIGNED, PRICE_PROPOSED, APPROVED, IN_PROGRESS, DONE, COMPLETED, REVIEWED, REFUNDED, CANCELLED
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: true
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
RequestStatusHistory.associate = (models) => {
  RequestStatusHistory.belongsTo(models.Request, { foreignKey: 'request_id', as: 'request' });
  RequestStatusHistory.belongsTo(models.User, { foreignKey: 'changed_by', as: 'modifier' });
};

module.exports = RequestStatusHistory;