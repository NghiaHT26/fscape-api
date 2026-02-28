const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Contract = require('./contract.model');

const ContractExtension = sequelize.define('ContractExtension', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },

    contract_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    previous_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    new_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    extension_months: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },

    reason: {
        type: DataTypes.TEXT
    },

    approved_by: {
        type: DataTypes.UUID, allowNull: true
    } // ID của Manager duyệt
}, {
    tableName: 'contract_extensions',
    timestamps: true,
    underscored: true
});

/* Relation */
Contract.hasMany(ContractExtension, { foreignKey: 'contract_id', as: 'extensions' });
ContractExtension.belongsTo(Contract, { foreignKey: 'contract_id' });

module.exports = ContractExtension;