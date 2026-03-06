const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.use(authJwt);

// List all contracts — ADMIN (full + timestamps), BM (scoped to building, no timestamps)
router.get('/', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), contractController.getAllContracts);

// My contracts — RESIDENT / CUSTOMER
router.get('/my', requireRoles(ROLES.RESIDENT, ROLES.CUSTOMER), contractController.getMyContracts);

// Contract detail — ADMIN / BM / RESIDENT (owner)
router.get('/:id', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.RESIDENT), contractController.getContractById);

// No POST — contracts are created internally by the system (via booking flow)
// No DELETE — contracts cannot be deleted

// Update contract — ADMIN / BM (extend duration, adjust end_date, etc.)
router.put('/:id', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), contractController.updateContract);

// Approve contract — ADMIN / BM
router.patch('/:id/approve', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), contractController.approveContract);

module.exports = router;
