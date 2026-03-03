module.exports = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || "2QXG2YYS", // Thay bằng mã website của bạn từ VNPay
    vnp_HashSecret: process.env.VNP_HASH_SECRET || "BGLJNRXUPZTYKUZAYXGZZHZZXMVZCHXN", // Thay bằng secret key từ VNPay
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:5173/payment/vnpay-return"
};
