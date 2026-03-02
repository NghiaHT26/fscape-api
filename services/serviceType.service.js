const { Op } = require('sequelize');
const ServiceType = require('../models/serviceType.model');

class ServiceTypeService {
  // CREATE
  static async create(data) {
    return ServiceType.create({
      name: data.name,
      unit_price: data.unit_price,
    });
  }

  static async findAll({ page = 1, limit = 10, search } = {}) {
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`, 
      };
    }

    const { rows, count } = await ServiceType.findAndCountAll({
      where,
      limit,
      offset,
      order: [['name', 'ASC']],
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  // GET BY ID
  static async findById(id) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) {
      throw new Error('ServiceType not found');
    }
    return serviceType;
  }

  // UPDATE
  static async update(id, data) {
    const serviceType = await this.findById(id);

    await serviceType.update({
      name: data.name ?? serviceType.name,
      unit_price: data.unit_price ?? serviceType.unit_price,
    });

    return serviceType;
  }

  // DELETE
  static async delete(id) {
    const serviceType = await this.findById(id);
    await serviceType.destroy();
    return true;
  }
}

module.exports = ServiceTypeService;