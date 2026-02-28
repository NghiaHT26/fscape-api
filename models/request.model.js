const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('./room.model');
const User = require('./user.model');
const Asset = require('./asset.model');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    request_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    room_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    resident_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    assigned_staff_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    request_type: {
        type: DataTypes.ENUM('REPAIR', 'CLEANING', 'COMPLAINT', 'ASSET_CHANGE', 'CHECKOUT', 'OTHER'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'ASSIGNED', 'PRICE_PROPOSED', 'APPROVED', 'IN_PROGRESS', 'DONE', 'COMPLETED', 'REVIEWED', 'REFUNDED', 'CANCELLED'),
        defaultValue: 'PENDING'
    },
    related_asset_id: {
        type: DataTypes.UUID,
        allowNull: true
    }, // Dùng cho loại REPAIR
    service_price: {
        type: DataTypes.DECIMAL(15, 2)
    }, // Giá Staff đề xuất
    completion_note: {
        type: DataTypes.TEXT
    },
    completed_at: {
        type: DataTypes.DATE
    },
    feedback_rating: {
        type: DataTypes.SMALLINT
    }, // 1-5 sao
    feedback_comment: {
        type: DataTypes.TEXT
    },
    report_reason: {
        type: DataTypes.TEXT
    }, // Khi resident không hài lòng
    refund_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'requests',
    timestamps: true,
    underscored: true
});

/* Relations */
Request.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Request.belongsTo(User, { foreignKey: 'resident_id', as: 'resident' });
Request.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'staff' });
Request.belongsTo(Asset, { foreignKey: 'related_asset_id', as: 'asset' });

module.exports = Request;