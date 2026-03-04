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
        type: DataTypes.ENUM('ADMIN', 'BUILDING_MANAGER', 'STAFF', 'RESIDENT', 'CUSTOMER'),
        allowNull: false
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

module.exports = User;