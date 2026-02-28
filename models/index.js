const Contract = require('./contract.model');
const ContractType = require('./contractType.model');

Contract.belongsTo(ContractType, {
  foreignKey: 'service_type_id',
  as: 'serviceType',
});

ContractType.hasMany(Contract, {
  foreignKey: 'service_type_id',
  as: 'contracts',
});

module.exports = {
  Contract,
  ContractType,
};