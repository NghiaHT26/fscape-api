const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Invoice = require('./invoice.model');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true, 
    defaultValue: DataTypes.UUIDV4 
  },

  invoice_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  
  item_type: { 
    type: DataTypes.STRING(50), 
    allowNull: false // 'RENT', 'SERVICE', 'PENALTY', 'REFUND'
  },

  description: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },

  quantity: { 
    type: DataTypes.DECIMAL(10, 2), 
    defaultValue: 1 
  },

  unit_price: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },

  amount: { 
    type: DataTypes.DECIMAL(15, 2), 
    allowNull: false 
  },
  
  reference_id: { 
    type: DataTypes.UUID 
  }, // ID của Request liên quan

  reference_type: { 
    type: DataTypes.STRING(50) 
  } // 'REQUEST'
}, {
  tableName: 'invoice_items',
  timestamps: true,
  underscored: true
});

/* Relation */
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });

module.exports = InvoiceItem;