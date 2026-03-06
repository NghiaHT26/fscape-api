const RENTAL_TERMS = {
    MONTHLY: 1,
    SEMI_ANNUALLY: 6,
    INDEFINITE: null,
};

// Số tháng cọc tương ứng với từng rental term
const DEPOSIT_MONTHS = {
    [RENTAL_TERMS.MONTHLY]: 1,
    [RENTAL_TERMS.SEMI_ANNUALLY]: 6,
};
const DEFAULT_DEPOSIT_MONTHS = 1;

const BOOKING_EXPIRY_MS = 60 * 60 * 1000; // 1 giờ

module.exports = {
    RENTAL_TERMS,
    DEPOSIT_MONTHS,
    DEFAULT_DEPOSIT_MONTHS,
    BOOKING_EXPIRY_MS,
};
