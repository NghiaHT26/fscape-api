const roomService = require('../services/room.service');

const handleError = (res, err) => {
    console.error('[RoomController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ message });
};

const getAllRooms = async (req, res) => {
    try {
        const result = await roomService.getAllRooms(req.query, req.user);
        return res.status(200).json({ ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await roomService.getRoomById(req.params.id, req.user);
        return res.status(200).json({ data: room });
    } catch (err) {
        return handleError(res, err);
    }
};

const createRoom = async (req, res) => {
    try {
        const roomData = { ...req.body };

        if (!roomData.room_number || !roomData.building_id || !roomData.room_type_id || roomData.floor === undefined) {
            return res.status(400).json({
                message: 'Missing required fields: room_number, building_id, room_type_id, floor'
            });
        }

        const room = await roomService.createRoom(roomData);

        return res.status(201).json({
            message: 'Room created successfully',
            data: room
        });

    } catch (err) {
        return handleError(res, err);
    }
};

const updateRoom = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const room = await roomService.updateRoom(req.params.id, updateData);

        return res.status(200).json({
            message: 'Room updated successfully',
            data: room
        });

    } catch (err) {
        return handleError(res, err);
    }
};

const deleteRoom = async (req, res) => {
    try {
        const result = await roomService.deleteRoom(req.params.id);
        return res.status(200).json({ ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const toggleRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Missing required field: status' });
        }

        const room = await roomService.toggleRoomStatus(req.params.id, status, req.user);
        return res.status(200).json({
            message: `Room status updated to ${status}`,
            data: room
        });
    } catch (err) {
        return handleError(res, err);
    }
};

const getRoomsByBuilding = async (req, res, next) => {
  try {

    const { buildingId } = req.params;

    const rooms = await roomService.getRoomsByBuilding(
      buildingId,
      req.query,
      req.user
    );

    res.json({
      success: true,
      data: rooms
    });

  } catch (error) {
    next(error);
  }
};
module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    toggleRoomStatus,
    getRoomsByBuilding
};
