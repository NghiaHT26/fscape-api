const invoiceService = require('../services/invoice.service');

const triggerInvoiceJob = async (req, res) => {
    try {
        const count = await invoiceService.generatePeriodicInvoices();
        return res.status(200).json({ message: `Đã sinh thành công ${count} hóa đơn.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi sinh hóa đơn' });
    }
};

const getMyInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const invoices = await invoiceService.getMyInvoices(userId);
        return res.status(200).json({ data: invoices });
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách hóa đơn' });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const invoice = await invoiceService.getInvoiceById(userId, id);
        return res.status(200).json({ data: invoice });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || 'Lỗi khi lấy hóa đơn' });
    }
};

module.exports = {
    triggerInvoiceJob,
    getMyInvoices,
    getInvoiceById
};
