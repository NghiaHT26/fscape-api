const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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

NotificationRecipient.associate = (models) => {
  NotificationRecipient.belongsTo(models.Notification, { foreignKey: 'notification_id' });
  NotificationRecipient.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = NotificationRecipient;