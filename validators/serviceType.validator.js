const { body, query, param } = require('express-validator');

exports.create = [
  body('name')
    .notEmpty().withMessage('name is required')
    .isLength({ max: 255 }).withMessage('name max 255 characters'),

  body('unit_price')
    .notEmpty().withMessage('unit_price is required')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('unit_price must be a decimal number'),
];

exports.update = [
  param('id')
    .isUUID().withMessage('Invalid service type id'),

  body('name')
    .optional()
    .isLength({ max: 255 }).withMessage('name max 255 characters'),

  body('unit_price')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('unit_price must be a decimal number'),
];

exports.pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
];