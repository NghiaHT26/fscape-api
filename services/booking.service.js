const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createBooking = async (userId, bookingData) => {
    const { Booking, Room, RoomType, User, CustomerProfile } = sequelize.models;
    const { roomId, checkInDate, rentalTerm, customerInfo } = bookingData;

    const transaction = await sequelize.transaction();

    try {
        // 1. Kiểm tra phòng tồn tại và còn trống
        const room = await Room.findByPk(roomId, {
            include: [{ model: RoomType, as: 'room_type' }],
            transaction
        });

        if (!room) {
            throw { status: 404, message: 'Không tìm thấy phòng.' };
        }

        if (room.status !== 'AVAILABLE') {
            throw { status: 400, message: 'Phòng này hiện không còn trống.' };
        }

        // 2. Tính toán tiền cọc (mặc định 1 tháng tiền phòng)
        const basePrice = Number(room.room_type?.base_price || 0);
        const depositAmount = basePrice; // Có thể tùy chỉnh logic tính cọc ở đây

        // 3. Tạo booking number ngẫu nhiên
        const bookingNumber = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 4. Lưu thông tin hồ sơ khách hàng (CustomerProfile)
        const [profile, created] = await CustomerProfile.findOrCreate({
            where: { user_id: userId },
            defaults: {
                gender: customerInfo.gender?.toUpperCase(),
                date_of_birth: customerInfo.dateOfBirth,
                permanent_address: customerInfo.permanentAddress,
                emergency_contact_name: customerInfo.emergencyContactName,
                emergency_contact_phone: customerInfo.emergencyContactPhone
            },
            transaction
        });

        if (!created && customerInfo) {
            await profile.update({
                gender: customerInfo.gender?.toUpperCase() || profile.gender,
                date_of_birth: customerInfo.dateOfBirth || profile.date_of_birth,
                permanent_address: customerInfo.permanentAddress || profile.permanent_address,
                emergency_contact_name: customerInfo.emergencyContactName || profile.emergency_contact_name,
                emergency_contact_phone: customerInfo.emergencyContactPhone || profile.emergency_contact_phone
            }, { transaction });
        }

        // 5. Tạo bản ghi Booking
        const booking = await Booking.create({
            booking_number: bookingNumber,
            room_id: roomId,
            customer_id: userId,
            check_in_date: checkInDate,
            status: 'PENDING',
            room_price_snapshot: basePrice,
            deposit_amount: depositAmount,
            notes: `Rental term: ${rentalTerm} months`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // Hết hạn sau 24h nếu không thanh toán
        }, { transaction });

        // 6. Cập nhật trạng thái phòng thành LOCKED để giữ chỗ (tùy policy)
        // room.status = 'LOCKED';
        // await room.save({ transaction });

        await transaction.commit();
        return booking;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getMyBookings = async (userId) => {
    const { Booking, Room, Building } = sequelize.models;
    return await Booking.findAll({
        where: { customer_id: userId },
        include: [
            {
                model: Room,
                as: 'room',
                include: [{ model: Building, as: 'building' }]
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const getBookingById = async (id, userId) => {
    const { Booking, Room, Building, RoomType } = sequelize.models;
    const booking = await Booking.findByPk(id, {
        include: [
            {
                model: Room,
                as: 'room',
                include: [
                    { model: Building, as: 'building' },
                    { model: RoomType, as: 'room_type' }
                ]
            }
        ]
    });

    if (!booking) throw { status: 404, message: 'Không tìm thấy đơn đặt phòng.' };
    if (booking.customer_id !== userId) throw { status: 403, message: 'Bạn không có quyền truy cập đơn này.' };

    return booking;
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById
};
