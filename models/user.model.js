const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: false // ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER
    },
    first_name: {
        type: DataTypes.STRING(100)
    },
    last_name: {
        type: DataTypes.STRING(100)
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    avatar_url: {
        type: DataTypes.TEXT
    },
    building_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

User.associate = (models) => {
    User.hasOne(models.CustomerProfile, { foreignKey: 'user_id', as: 'profile' });
    User.hasMany(models.Booking, { foreignKey: 'customer_id', as: 'bookings' });
    User.hasMany(models.Payment, { foreignKey: 'user_id', as: 'payments' });
};

module.exports = User;