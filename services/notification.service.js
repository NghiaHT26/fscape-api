const { sequelize } = require('../config/db');
const Notification = require('../models/notification.model');
const NotificationRecipient = require('../models/notificationRecipient.model');
const User = require('../models/user.model');

/**
 * Tạo mới thông báo và gửi đến danh sách người nhận
 */
const createNotification = async (payload) => {
    const {
        type,
        title,
        content,
        target_type,
        target_id,
        reference_type,
        reference_id,
        created_by,
        specific_user_ids = [] // Mảng ID người nhận cụ thể truyền vào
    } = payload;

    const transaction = await sequelize.transaction();
    try {
        const notification = await Notification.create({
            type,
            title,
            content,
            target_type,
            target_id,
            reference_type,
            reference_id,
            created_by
        }, { transaction });

        let recipientsSet = new Set(specific_user_ids);

        if (target_type === 'USER' && target_id) {
            recipientsSet.add(target_id);
        } else if (target_type === 'ALL') {
            const allUsers = await User.findAll({ attributes: ['id'], where: { is_active: true } });
            allUsers.forEach(u => recipientsSet.add(u.id));
        }

        if (recipientsSet.size > 0) {
            const recipientRecords = Array.from(recipientsSet).map(userId => ({
                notification_id: notification.id,
                user_id: userId
            }));
            await NotificationRecipient.bulkCreate(recipientRecords, { transaction });
        }

        await transaction.commit();
        return notification;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Lấy danh sách thông báo của 1 User (Dùng cho API Resident/Staff xem thông báo)
 */
const getUserNotifications = async (userId, { page = 1, limit = 10, is_read } = {}) => {
    const offset = (page - 1) * limit;
    const where = { user_id: userId };
    if (is_read !== undefined) where.is_read = is_read === 'true';

    const { count, rows } = await NotificationRecipient.findAndCountAll({
        where,
        include: [{ 
            model: Notification, 
            as: 'notification',
            attributes: ['type', 'title', 'content', 'reference_type', 'reference_id', 'createdAt']
        }],
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
    });

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

/**
 * Đánh dấu đã đọc
 */
const markAsRead = async (notificationId, userId) => {
    const recipient = await NotificationRecipient.findOne({
        where: { notification_id: notificationId, user_id: userId }
    });

    if (recipient && !recipient.is_read) {
        recipient.is_read = true;
        recipient.read_at = new Date();
        await recipient.save();
    }
    return recipient;
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead
};