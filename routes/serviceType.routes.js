const express = require('express');
const router = express.Router();

const controller = require('../controllers/serviceType.controller');
const validate = require('../middlewares/validateResult');
const authJwt = require('../middlewares/authJwt');
const requireRole = require('../middlewares/requireRole');
const { serviceTypeValidator } = require('../validators');

/**
 * @swagger
 * tags:
 *   name: ServiceTypes
 *   description: Service Type management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Electricity
 *         unit_price:
 *           type: number
 *           example: 3500
 *
 *     CreateServiceType:
 *       type: object
 *       required:
 *         - name
 *         - unit_price
 *       properties:
 *         name:
 *           type: string
 *           example: Electricity
 *         unit_price:
 *           type: number
 *           example: 3500
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceType'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 */

/**
 * @swagger
 * /api/service-types:
 *   post:
 *     summary: Create service type (ADMIN only)
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceType'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  authJwt,
  requireRole('ADMIN'),
  serviceTypeValidator.create,
  validate,
  controller.createServiceType
);

/**
 * @swagger
 * /api/service-types:
 *   get:
 *     summary: Get all service types (pagination + search)
 *     tags: [ServiceTypes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: elec
 *     responses:
 *       200:
 *         description: List service types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 */
router.get(
  '/',
  serviceTypeValidator.pagination,
  validate,
  controller.getAllServiceTypes
);

/**
 * @swagger
 * /api/service-types/{id}:
 *   get:
 *     summary: Get service type by id (ADMIN only)
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service type detail
 *       404:
 *         description: Not found
 */
router.get('/:id', authJwt, requireRole('ADMIN'), controller.getServiceTypeById);

/**
 * @swagger
 * /api/service-types/{id}:
 *   put:
 *     summary: Update service type (ADMIN only)
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceType'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  '/:id',
  authJwt,
  requireRole('ADMIN'),
  serviceTypeValidator.update,
  validate,
  controller.updateServiceType
);

/**
 * @swagger
 * /api/service-types/{id}:
 *   delete:
 *     summary: Delete service type (ADMIN only)
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
router.delete('/:id', authJwt, requireRole('ADMIN'), controller.deleteServiceType);

module.exports = router;