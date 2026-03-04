const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    }, 
    custom_item_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    service_price: {
        type: DataTypes.DECIMAL(15, 2)
    }, 
    completion_note: {
        type: DataTypes.TEXT
    },
    completed_at: {
        type: DataTypes.DATE
    },
    feedback_rating: {
        type: DataTypes.SMALLINT
    }, 
    feedback_comment: {
        type: DataTypes.TEXT
    },
    feedback_at: {
        type: DataTypes.DATE
    },
    report_reason: {
        type: DataTypes.TEXT
    }, 
    reported_at: {
        type: DataTypes.DATE
    },
    refund_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    refund_approved_by: {
        type: DataTypes.UUID,
        allowNull: true
    },
    refund_approved_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'requests',
    timestamps: true,
    underscored: true
});

/* Relations */
Request.associate = (models) => {
    Request.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
    Request.belongsTo(models.User, { foreignKey: 'resident_id', as: 'resident' });
    Request.belongsTo(models.User, { foreignKey: 'assigned_staff_id', as: 'staff' });
    Request.belongsTo(models.Asset, { foreignKey: 'related_asset_id', as: 'asset' });
    Request.belongsTo(models.User, { foreignKey: 'refund_approved_by', as: 'refund_approver' });
    
    Request.hasMany(models.RequestImage, { foreignKey: 'request_id', as: 'images', onDelete: 'CASCADE' });
    Request.hasMany(models.RequestStatusHistory, { foreignKey: 'request_id', as: 'status_history', onDelete: 'CASCADE' });
};

module.exports = Request;