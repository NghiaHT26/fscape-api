const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false // CONTRACT_PENDING, INVOICE_GENERATED, MAINTENANCE_REQUEST, REQUEST_ASSIGNED, REQUEST_STATUS_CHANGED, REQUEST_REPORTED, GENERAL_ANNOUNCEMENT
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_type: {
    type: DataTypes.STRING(20),
    allowNull: false // USER, ROOM, BUILDING, ALL
  },
  target_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reference_type: {
    type: DataTypes.STRING(20),
    allowNull: true // CONTRACT, INVOICE, REQUEST
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

Notification.associate = (models) => {
  Notification.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });

  // NotificationRecipient relation
  Notification.hasMany(models.NotificationRecipient, { foreignKey: 'notification_id', as: 'recipients', onDelete: 'CASCADE' });
};

module.exports = Notification;