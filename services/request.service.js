const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Request = require('../models/request.model');
const RequestImage = require('../models/requestImage.model');
const RequestStatusHistory = require('../models/requestStatusHistory.model');
const notificationService = require('./notification.service');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const Asset = require('../models/asset.model');
const Building = require('../models/building.model');
const { ROLES } = require('../constants/roles');
const { createNotification } = require('./notification.service');
// Helper sinh mã Request tự động (VD: REQ-20260302-001)
const generateRequestNumber = async () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // Đếm số lượng request trong ngày
    const count = await Request.count({
        where: {
            request_number: { [Op.like]: `REQ-${dateStr}-%` }
        }
    });

    const nextId = String(count + 1).padStart(3, '0');
    return `REQ-${dateStr}-${nextId}`;
};

const getAllRequests = async (caller, { page = 1, limit = 10, status, request_type, room_id, assigned_staff_id, search } = {}) => {
    const offset = (page - 1) * limit;
    const where = {};
    const roomInclude = {
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'floor', 'building_id']
    };

    if (status) where.status = status;
    if (request_type) where.request_type = request_type;
    if (room_id) where.room_id = room_id;
    if (assigned_staff_id) where.assigned_staff_id = assigned_staff_id;

    // Search by title or request_number
    if (search) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { request_number: { [Op.iLike]: `%${search}%` } },
        ];
    }

    if (caller.role === ROLES.BUILDING_MANAGER) {
        if (!caller.building_id) throw new Error('Building manager is not assigned to any building');
        roomInclude.where = { building_id: caller.building_id };
        roomInclude.required = true;
    } else if (caller.role === ROLES.STAFF) {
        where.assigned_staff_id = caller.id;
    } else if (caller.role === ROLES.RESIDENT) {
        where.resident_id = caller.id;
    }
    // ADMIN sees all — no extra filter

    const { count, rows } = await Request.findAndCountAll({
        where,
        include: [
            roomInclude,
            { model: User, as: 'resident', attributes: ['id', 'first_name', 'last_name', 'email'] },
            { model: User, as: 'staff', attributes: ['id', 'first_name', 'last_name'] }
        ],
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

const getRequestById = async (caller, id) => {
    const request = await Request.findByPk(id, {
        include: [
            {
                model: Room, as: 'room',
                attributes: ['id', 'room_number', 'floor', 'building_id'],
                include: [{ model: Building, as: 'building', attributes: ['id', 'name'] }],
            },
            { model: User, as: 'resident', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
            { model: User, as: 'staff', attributes: ['id', 'first_name', 'last_name', 'phone'] },
            { model: Asset, as: 'asset', attributes: ['id', 'qr_code'] },
            { model: RequestImage, as: 'images' },
            {
                model: RequestStatusHistory,
                as: 'status_history',
                include: [{ model: User, as: 'modifier', attributes: ['id', 'first_name', 'last_name', 'role'] }],
                order: [['createdAt', 'DESC']]
            }
        ]
    });

    if (!request) throw { status: 404, message: 'Request not found' };

    // Access check
    if (caller.role === ROLES.BUILDING_MANAGER) {
        if (request.room?.building_id !== caller.building_id) {
            throw { status: 403, message: 'Permission denied' };
        }
    } else if (caller.role === ROLES.STAFF) {
        if (request.assigned_staff_id !== caller.id) {
            throw { status: 403, message: 'Permission denied' };
        }
    } else if (caller.role === ROLES.RESIDENT) {
        if (request.resident_id !== caller.id) {
            throw { status: 403, message: 'Permission denied' };
        }
    }

    return request;
};

const createRequest = async (data) => {
    const { imageUrls, ...requestData } = data;
    const transaction = await sequelize.transaction();

    try {
        requestData.request_number = await generateRequestNumber();
        requestData.status = 'PENDING';

        const request = await Request.create(requestData, { transaction });

        // 1. Lưu ảnh (Resident upload lên làm bằng chứng)
        if (imageUrls && imageUrls.length > 0) {
            const imageRecords = imageUrls.map(url => ({
                request_id: request.id,
                image_url: url,
                image_type: 'ATTACHMENT',
                uploaded_by: requestData.resident_id
            }));
            await RequestImage.bulkCreate(imageRecords, { transaction });
        }

        // 2. Ghi log khởi tạo
        await RequestStatusHistory.create({
            request_id: request.id,
            from_status: null,
            to_status: 'PENDING',
            changed_by: requestData.resident_id,
            reason: 'User created request'
        }, { transaction });

        // 3️ Notify STAFF + MANAGER
        await createNotification({
            type: "REQUEST_CREATED",
            title: "New Service Request",
            content: `Request ${request.request_number} has been created. Please review and assign to staff.`,
            target_type: "REQUEST",
            target_id: request.id,
            created_by: requestData.resident_id,
            building_id: requestData.building_id,
            roles: ["BUILDING_MANAGER"]
        }, transaction);

        // 4️ Notify Resident (tạo thành công)
        await createNotification({
            type: "REQUEST_CREATED_SUCCESS",
            title: "Request Created",
            content: `Your request ${request.request_number} has been created successfully`,
            target_type: "REQUEST",
            target_id: request.id,
            created_by: requestData.resident_id,
            specific_user_ids: [requestData.resident_id]
        }, transaction);

        await transaction.commit();

        return getRequestById({ role: ROLES.ADMIN }, request.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const assignRequest = async (id, staff_id, manager_id) => {
    const request = await Request.findByPk(id);
    if (!request) throw { status: 404, message: 'Request not found' };

    const transaction = await sequelize.transaction();
    try {
        const oldStatus = request.status;

        await request.update({
            assigned_staff_id: staff_id,
            status: 'ASSIGNED'
        }, { transaction });

        await RequestStatusHistory.create({
            request_id: request.id,
            from_status: oldStatus,
            to_status: 'ASSIGNED',
            changed_by: manager_id,
            reason: 'Manager assigned task to staff'
        }, { transaction });

        await transaction.commit();

        // Bắn thông báo cho Staff
        await notificationService.createNotification({
            type: 'REQUEST_ASSIGNED',
            title: 'Nhiệm vụ mới',
            content: `Bạn vừa được giao xử lý yêu cầu ${request.request_number}`,
            target_type: 'USER',
            target_id: staff_id,
            reference_type: 'REQUEST',
            reference_id: request.id,
            created_by: manager_id
        });

        return getRequestById({ role: ROLES.ADMIN }, id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateRequestStatus = async (id, updateData) => {
    const { status, changed_by, reason, completionImages, service_price, completion_note, feedback_rating, feedback_comment, report_reason } = updateData;

    const request = await Request.findByPk(id);
    if (!request) throw { status: 404, message: 'Request not found' };

    const transaction = await sequelize.transaction();
    try {
        const oldStatus = request.status;

        // Build object để update vào bảng Requests dựa theo trạng thái
        const requestUpdatePayload = { status };

        if (service_price) requestUpdatePayload.service_price = service_price;
        if (completion_note) requestUpdatePayload.completion_note = completion_note;
        if (status === 'DONE') requestUpdatePayload.completed_at = new Date();

        if (status === 'COMPLETED' && feedback_rating) {
            requestUpdatePayload.feedback_rating = feedback_rating;
            requestUpdatePayload.feedback_comment = feedback_comment;
            requestUpdatePayload.feedback_at = new Date();
        }

        if (status === 'REVIEWED' && report_reason) {
            requestUpdatePayload.report_reason = report_reason;
            requestUpdatePayload.reported_at = new Date();
        }

        await request.update(requestUpdatePayload, { transaction });

        // Nếu Staff up ảnh hoàn thành công việc
        if (completionImages && completionImages.length > 0) {
            const imageRecords = completionImages.map(url => ({
                request_id: id,
                image_url: url,
                image_type: 'COMPLETION',
                uploaded_by: changed_by
            }));
            await RequestImage.bulkCreate(imageRecords, { transaction });
        }

        // Ghi Log lịch sử
        await RequestStatusHistory.create({
            request_id: id,
            from_status: oldStatus,
            to_status: status,
            changed_by: changed_by,
            reason: reason || `Status updated to ${status}`
        }, { transaction });

        await transaction.commit();

        // Bắn thông báo cho Resident khi trạng thái thay đổi
        let notifTitle = 'Cập nhật yêu cầu';
        let notifContent = `Yêu cầu ${request.request_number} của bạn đã chuyển sang trạng thái: ${status}`;

        if (status === 'PRICE_PROPOSED') {
            notifTitle = 'Có báo giá dịch vụ mới';
            notifContent = `Nhân viên đã báo giá cho yêu cầu ${request.request_number}. Vui lòng kiểm tra và xác nhận.`;
        } else if (status === 'DONE') {
            notifTitle = 'Yêu cầu đã hoàn thành';
            notifContent = `Nhân viên đã hoàn thành yêu cầu ${request.request_number}. Vui lòng đánh giá dịch vụ.`;
        }

        await notificationService.createNotification({
            type: 'REQUEST_STATUS_CHANGED',
            title: notifTitle,
            content: notifContent,
            target_type: 'USER',
            target_id: request.resident_id, // Gửi cho người tạo request
            reference_type: 'REQUEST',
            reference_id: request.id,
            created_by: changed_by
        });

        return getRequestById({ role: ROLES.ADMIN }, id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllRequests,
    getRequestById,
    createRequest,
    assignRequest,
    updateRequestStatus
};
