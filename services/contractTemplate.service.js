const ContractTemplate = require('../models/contractTemplate.model');

const getAllTemplates = async () => {
    return await ContractTemplate.findAll({ order: [['created_at', 'DESC']] });
};

const createTemplate = async (data) => {
    if (data.is_default) {
        await ContractTemplate.update({ is_default: false }, { where: { is_default: true } });
    }
    return await ContractTemplate.create(data);
};

const updateTemplate = async (id, data) => {
    const template = await ContractTemplate.findByPk(id);
    if (!template) throw { status: 404, message: 'Template not found' };
    
    if (data.is_default) {
        await ContractTemplate.update({ is_default: false }, { where: { is_default: true, id: { [Op.ne]: id } } });
    }
    return await template.update(data);
};

module.exports = { getAllTemplates, createTemplate, updateTemplate };