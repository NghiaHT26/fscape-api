const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Notification = require('./notification.model');
const User = require('./user.model');

const NotificationRecipient = sequelize.define('NotificationRecipient', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  notification_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'notifications', key: 'id' }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notification_recipients',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    { unique: true, fields: ['notification_id', 'user_id'] }
  ]
});

/* ===== RELATIONS ===== */
Notification.hasMany(NotificationRecipient, { foreignKey: 'notification_id', as: 'recipients', onDelete: 'CASCADE' });
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notification_id' });
User.hasMany(NotificationRecipient, { foreignKey: 'user_id', as: 'user_notifications' });
NotificationRecipient.belongsTo(User, { foreignKey: 'user_id' });

module.exports = NotificationRecipient;