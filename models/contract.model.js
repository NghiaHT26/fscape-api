const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Room = require('./room.model');
const ContractTemplate = require('./contractTemplate.model');

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contract_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: "contracts_contract_number_key"
  },
  template_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'contract_templates',
      key: 'id'
    }
  },
  room_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  term_type: {
    type: DataTypes.ENUM("FIXED_TERM", "INDEFINITE"),
    allowNull: false,
    defaultValue: "FIXED_TERM"
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  base_rent: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  deposit_amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  billing_cycle: {
    type: DataTypes.ENUM("MONTHLY", "SEMI_ANNUALLY"),
    allowNull: true,
    defaultValue: "MONTHLY"
  },
  next_billing_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  last_billed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("DRAFT", "PENDING_CUSTOMER_SIGNATURE", "PENDING_MANAGER_SIGNATURE", "ACTIVE", "EXPIRING_SOON", "FINISHED", "TERMINATED"),
    allowNull: true,
    defaultValue: "DRAFT"
  },
  customer_signature_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customer_signed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  manager_signature_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_signed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rendered_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dynamic_fields: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  pdf_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'contracts',
  schema: 'public',
  timestamps: true,
    underscored: true,
  indexes: [
    {
      name: "contracts_contract_number_key",
      unique: true,
      fields: [
        { name: "contract_number" },
      ]
    },
    {
      name: "contracts_pkey",
      unique: true,
      fields: [
        { name: "id" },
      ]
    },
    {
      name: "idx_contracts_contract_number",
      fields: [
        { name: "contract_number" },
      ]
    },
    {
      name: "idx_contracts_customer_id",
      fields: [
        { name: "customer_id" },
      ]
    },
    {
      name: "idx_contracts_end_date",
      fields: [
        { name: "end_date" },
      ]
    },
    {
      name: "idx_contracts_manager_id",
      fields: [
        { name: "manager_id" },
      ]
    },
    {
      name: "idx_contracts_next_billing_date",
      fields: [
        { name: "next_billing_date" },
      ]
    },
    {
      name: "idx_contracts_room_id",
      fields: [
        { name: "room_id" },
      ]
    },
    {
      name: "idx_contracts_start_date",
      fields: [
        { name: "start_date" },
      ]
    }, {
      name: "idx_contracts_status",
      fields: [
        { name: "status" },
      ]
    },
  ]
});

Contract.associate = (models) => {
  Contract.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
  Contract.belongsTo(models.User, { foreignKey: 'customer_id', as: 'customer' });
  Contract.belongsTo(models.User, { foreignKey: 'manager_id', as: 'manager' });
  Contract.belongsTo(models.ContractTemplate, { foreignKey: 'template_id', as: 'template' });
  Contract.hasMany(models.Invoice, { foreignKey: 'contract_id', as: 'invoices' });
  Contract.hasMany(models.Payment, { foreignKey: 'contract_id', as: 'payments' });
};

module.exports = Contract;
