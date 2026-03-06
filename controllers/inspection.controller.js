const inspectionService = require('../services/inspection.service');

const handleError = (res, err) => {
    console.error('[InspectionController]', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

const previewInspection = async (req, res) => {
    try {
        const { room_id, qr_codes, type } = req.body;
        if (!room_id || !Array.isArray(qr_codes) || !type) {
            return res.status(400).json({ message: 'room_id, qr_codes[], and type (CHECK_IN|CHECK_OUT) are required' });
        }
        if (!['CHECK_IN', 'CHECK_OUT'].includes(type)) {
            return res.status(400).json({ message: 'type must be CHECK_IN or CHECK_OUT' });
        }
        const result = await inspectionService.previewInspection(room_id, qr_codes, type, req.user);
        return res.status(200).json({ data: result });
    } catch (err) { return handleError(res, err); }
};

const confirmInspection = async (req, res) => {
    try {
        const { room_id, qr_codes, type, notes } = req.body;
        if (!room_id || !Array.isArray(qr_codes) || !type) {
            return res.status(400).json({ message: 'room_id, qr_codes[], and type (CHECK_IN|CHECK_OUT) are required' });
        }
        if (!['CHECK_IN', 'CHECK_OUT'].includes(type)) {
            return res.status(400).json({ message: 'type must be CHECK_IN or CHECK_OUT' });
        }
        const result = await inspectionService.confirmInspection(room_id, qr_codes, type, notes, req.user);
        return res.status(201).json({ message: 'Inspection recorded', data: result });
    } catch (err) { return handleError(res, err); }
};

const settleInspection = async (req, res) => {
    try {
        const result = await inspectionService.settleInspection(req.params.id, req.user);
        return res.status(200).json({ message: 'Deposit deduction applied', data: result });
    } catch (err) { return handleError(res, err); }
};

module.exports = { previewInspection, confirmInspection, settleInspection };
