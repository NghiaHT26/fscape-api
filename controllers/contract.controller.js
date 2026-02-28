const contractService = require('../services/contract.service');

const handleError = (res, err) => {
    console.error('[ContractController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

// [GET] /api/contracts
const getAllContracts = async (req, res) => {
    try {
        const result = await contractService.getAllContracts(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return handleError(res, err); }
};

// [GET] /api/contracts/:id
const getContractById = async (req, res) => {
    try {
        const contract = await contractService.getContractById(req.params.id);
        return res.status(200).json({ success: true, data: contract });
    } catch (err) { return handleError(res, err); }
};

// [POST] /api/contracts
const createContract = async (req, res) => {
    try {
        const { room_id, customer_id, start_date, base_rent, deposit_amount } = req.body;

        // Validation cơ bản
        if (!room_id || !customer_id || !start_date || !base_rent || !deposit_amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_id, customer_id, start_date, base_rent, deposit_amount'
            });
        }

        const contract = await contractService.createContract(req.body);
        return res.status(201).json({ 
            success: true, 
            message: 'Contract created as DRAFT', 
            data: contract 
        });
    } catch (err) { return handleError(res, err); }
};

// [PUT] /api/contracts/:id
const updateContract = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Body is empty' });
        }
        const contract = await contractService.updateContract(req.params.id, req.body);
        return res.status(200).json({ 
            success: true, 
            message: 'Contract updated successfully', 
            data: contract 
        });
    } catch (err) { return handleError(res, err); }
};

// [DELETE] /api/contracts/:id
const deleteContract = async (req, res) => {
    try {
        const result = await contractService.deleteContract(req.params.id);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return handleError(res, err); }
};

// [PATCH] /api/contracts/:id/approve
const approveContract = async (req, res) => {
    try {
        // ID Admin thực hiện duyệt lấy từ middleware auth
        const manager_id = req.user.id; 
        const contract = await contractService.updateContractStatus(req.params.id, 'ACTIVE', manager_id);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Contract approved and room status updated to OCCUPIED', 
            data: contract 
        });
    } catch (err) { return handleError(res, err); }
};

module.exports = { 
    getAllContracts, 
    getContractById, 
    createContract, 
    updateContract, 
    deleteContract, 
    approveContract 
};