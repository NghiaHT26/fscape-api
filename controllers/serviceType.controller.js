const ServiceTypeService = require('../services/serviceType.service');

// CREATE
exports.createServiceType = async (req, res) => {
  try {
    const serviceType = await ServiceTypeService.create(req.body);
    return res.status(201).json(serviceType);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAllServiceTypes = async (req, res) => {
  try {
    const serviceTypes = await ServiceTypeService.findAll(req.query);
    return res.json(serviceTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET ONE
exports.getServiceTypeById = async (req, res) => {
  try {
    const serviceType = await ServiceTypeService.findById(req.params.id);
    return res.json(serviceType);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

// UPDATE
exports.updateServiceType = async (req, res) => {
  try {
    const serviceType = await ServiceTypeService.update(
      req.params.id,
      req.body
    );
    return res.json(serviceType);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteServiceType = async (req, res) => {
  try {
    await ServiceTypeService.delete(req.params.id);
    return res.json({ message: 'ServiceType deleted successfully' });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};