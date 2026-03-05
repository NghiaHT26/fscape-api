const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Asset = require('../models/asset.model');
const AssetType = require('../models/assetType.model');
const AssetHistory = require('../models/assetHistory.model');
const AssetInspection = require('../models/assetInspection.model');
const Room = require('../models/room.model');
const RoomTypeAsset = require('../models/roomTypeAsset.model');
const Contract = require('../models/contract.model');
const auditService = require('./audit.service');

const { ROLES } = require('../constants/roles');

// ─── Helpers ──────────────────────────────────────────────────

function ensureBuildingAccess(user, room) {
    if (
        (user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) &&
        user.building_id !== room.building_id
    ) {
        throw { status: 403, message: 'You can only inspect rooms in your assigned building' };
    }
}

function resolveScannedAssets(qrCodes) {
    if (!qrCodes || qrCodes.length === 0) return Promise.resolve([]);
    return Asset.findAll({
        where: { qr_code: { [Op.in]: qrCodes } },
        include: [{ model: AssetType, as: 'asset_type', attributes: ['id', 'name', 'default_price'] }]
    });
}

function findUnknownQrCodes(qrCodes, scannedAssets) {
    const found = new Set(scannedAssets.map(a => a.qr_code));
    return qrCodes.filter(qr => !found.has(qr));
}

// ─── CHECK-IN diff (type-based, against template) ─────────────
async function computeCheckInDiff(room, qrCodes) {
    const template = await RoomTypeAsset.findAll({
        where: { room_type_id: room.room_type_id },
        include: [{ model: AssetType, as: 'asset_type', attributes: ['id', 'name', 'default_price'] }]
    });

    const scannedAssets = await resolveScannedAssets(qrCodes);
    const unknownQrCodes = findUnknownQrCodes(qrCodes, scannedAssets);

    // Validate: scanned assets must not already be in another room
    const conflicts = scannedAssets.filter(a => a.current_room_id && a.current_room_id !== room.id);
    if (conflicts.length > 0) {
        const qrs = conflicts.map(a => a.qr_code).join(', ');
        throw { status: 409, message: `Assets already assigned to another room: ${qrs}` };
    }

    // Group scanned by asset_type_id
    const scannedByType = {};
    for (const asset of scannedAssets) {
        if (!asset.asset_type_id) continue;
        if (!scannedByType[asset.asset_type_id]) scannedByType[asset.asset_type_id] = [];
        scannedByType[asset.asset_type_id].push(asset);
    }

    // Compare against template
    const results = [];
    const assetsToAssign = []; // assets that match template, will be assigned to room

    for (const item of template) {
        const typeId = item.asset_type_id;
        const expected = item.quantity;
        const scanned = scannedByType[typeId] || [];
        const actual = scanned.length;

        const entry = {
            asset_type_id: typeId,
            asset_type_name: item.asset_type.name,
            expected,
            actual,
            status: actual >= expected ? 'OK' : 'SHORT',
        };

        if (actual < expected) {
            entry.shortage = expected - actual;
        }

        // Take up to `expected` assets of this type for assignment
        const toAssign = scanned.slice(0, expected);
        assetsToAssign.push(...toAssign);

        results.push(entry);
    }

    // Extra: scanned assets whose type is not in the template
    const assignedIds = new Set(assetsToAssign.map(a => a.id));
    const extra = scannedAssets
        .filter(a => !assignedIds.has(a.id))
        .map(a => ({
            id: a.id,
            qr_code: a.qr_code,
            name: a.name,
            asset_type: a.asset_type ? a.asset_type.name : null,
        }));

    return { results, assetsToAssign, extra, unknown_qr_codes: unknownQrCodes, scannedAssets };
}

// ─── CHECK-OUT diff (exact asset match, against room's assets) ─
async function computeCheckOutDiff(room, qrCodes) {
    // Assets currently linked to this room
    const expectedAssets = await Asset.findAll({
        where: { current_room_id: room.id },
        include: [{ model: AssetType, as: 'asset_type', attributes: ['id', 'name', 'default_price'] }]
    });

    const scannedAssets = await resolveScannedAssets(qrCodes);
    const unknownQrCodes = findUnknownQrCodes(qrCodes, scannedAssets);

    const scannedIds = new Set(scannedAssets.map(a => a.id));
    const expectedIds = new Set(expectedAssets.map(a => a.id));

    // Matched: in room AND scanned
    const matched = expectedAssets.filter(a => scannedIds.has(a.id));

    // Missing: in room but NOT scanned
    const missing = expectedAssets.filter(a => !scannedIds.has(a.id));

    // Extra: scanned but NOT in room
    const extra = scannedAssets
        .filter(a => !expectedIds.has(a.id))
        .map(a => ({
            id: a.id,
            qr_code: a.qr_code,
            name: a.name,
            asset_type: a.asset_type ? a.asset_type.name : null,
            current_room_id: a.current_room_id,
        }));

    // Penalty = sum of default_price for missing assets
    let penaltyTotal = 0;
    const missingDetails = missing.map(a => {
        const price = Number(a.asset_type?.default_price || a.price || 0);
        penaltyTotal += price;
        return {
            id: a.id,
            qr_code: a.qr_code,
            name: a.name,
            asset_type: a.asset_type ? a.asset_type.name : null,
            penalty: price,
        };
    });

    const matchedDetails = matched.map(a => ({
        id: a.id,
        qr_code: a.qr_code,
        name: a.name,
        asset_type: a.asset_type ? a.asset_type.name : null,
    }));

    return {
        matched: matchedDetails,
        missing: missingDetails,
        extra,
        penalty_total: penaltyTotal,
        unknown_qr_codes: unknownQrCodes,
        // Raw arrays for DB operations
        _matchedAssets: matched,
        _missingAssets: missing,
        _scannedAssets: scannedAssets,
    };
}

// ─── POST /api/inspections/preview ────────────────────────────
const previewInspection = async (roomId, qrCodes, type, user) => {
    const room = await Room.findByPk(roomId);
    if (!room) throw { status: 404, message: 'Room not found' };
    ensureBuildingAccess(user, room);

    if (type === 'CHECK_IN') {
        const { results, extra, unknown_qr_codes } = await computeCheckInDiff(room, qrCodes);
        return { type: 'CHECK_IN', results, extra, unknown_qr_codes };
    } else {
        const { matched, missing, extra, penalty_total, unknown_qr_codes } = await computeCheckOutDiff(room, qrCodes);
        return { type: 'CHECK_OUT', matched, missing, extra, penalty_total, unknown_qr_codes };
    }
};

// ─── POST /api/inspections ────────────────────────────────────
const confirmInspection = async (roomId, qrCodes, type, notes, user) => {
    const room = await Room.findByPk(roomId);
    if (!room) throw { status: 404, message: 'Room not found' };
    ensureBuildingAccess(user, room);

    if (type === 'CHECK_IN') {
        return confirmCheckIn(room, qrCodes, notes, user);
    } else {
        return confirmCheckOut(room, qrCodes, notes, user);
    }
};

// ─── CHECK-IN: validate types → assign assets to room ─────────
async function confirmCheckIn(room, qrCodes, notes, user) {
    const { results, assetsToAssign, extra, unknown_qr_codes } = await computeCheckInDiff(room, qrCodes);

    const transaction = await sequelize.transaction();
    try {
        const inspection = await AssetInspection.create({
            room_id: room.id,
            performed_by: user.id,
            type: 'CHECK_IN',
            status: 'NO_DISCREPANCY',
            penalty_total: 0,
            notes
        }, { transaction });

        // Assign matched assets to room
        if (assetsToAssign.length > 0) {
            const assetIds = assetsToAssign.map(a => a.id);
            await Asset.update(
                { current_room_id: room.id, status: 'IN_USE' },
                { where: { id: { [Op.in]: assetIds } }, transaction }
            );

            // Log history for each assigned asset
            const historyRows = assetsToAssign.map(asset => ({
                asset_id: asset.id,
                from_room_id: asset.current_room_id,
                to_room_id: room.id,
                from_status: asset.status,
                to_status: 'IN_USE',
                action: 'CHECK_IN',
                performed_by: user.id,
                notes: `inspection:${inspection.id}`
            }));
            await AssetHistory.bulkCreate(historyRows, { transaction });
        }

        await transaction.commit();

        return {
            inspection: inspection.toJSON(),
            results,
            assets_assigned: assetsToAssign.length,
            extra,
            unknown_qr_codes
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// ─── CHECK-OUT: validate exact assets → record missing ────────
async function confirmCheckOut(room, qrCodes, notes, user) {
    const diff = await computeCheckOutDiff(room, qrCodes);
    const hasMissing = diff.missing.length > 0;

    const transaction = await sequelize.transaction();
    try {
        const inspection = await AssetInspection.create({
            room_id: room.id,
            performed_by: user.id,
            type: 'CHECK_OUT',
            status: hasMissing ? 'PENDING_SETTLEMENT' : 'NO_DISCREPANCY',
            penalty_total: diff.penalty_total,
            notes
        }, { transaction });

        // Log history for matched (scanned) assets
        const historyRows = [];
        for (const asset of diff._matchedAssets) {
            historyRows.push({
                asset_id: asset.id,
                from_room_id: room.id,
                to_room_id: room.id,
                from_status: asset.status,
                to_status: asset.status,
                action: 'INSPECTION_MATCHED',
                performed_by: user.id,
                notes: `inspection:${inspection.id}`
            });
        }

        // Log history for missing assets
        for (const asset of diff._missingAssets) {
            historyRows.push({
                asset_id: asset.id,
                from_room_id: room.id,
                to_room_id: room.id,
                from_status: asset.status,
                to_status: asset.status,
                action: 'INSPECTION_MISSING',
                performed_by: user.id,
                notes: `inspection:${inspection.id}`
            });
        }

        if (historyRows.length > 0) {
            await AssetHistory.bulkCreate(historyRows, { transaction });
        }

        // If no discrepancy, unassign all assets from room immediately
        if (!hasMissing) {
            const allAssetIds = diff._matchedAssets.map(a => a.id);
            if (allAssetIds.length > 0) {
                await Asset.update(
                    { current_room_id: null, status: 'AVAILABLE' },
                    { where: { id: { [Op.in]: allAssetIds } }, transaction }
                );
            }
        }

        await transaction.commit();

        return {
            inspection: inspection.toJSON(),
            matched: diff.matched,
            missing: diff.missing,
            extra: diff.extra,
            penalty_total: diff.penalty_total,
            unknown_qr_codes: diff.unknown_qr_codes
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// ─── POST /api/inspections/:id/settle ─────────────────────────
const settleInspection = async (inspectionId, user) => {
    const inspection = await AssetInspection.findByPk(inspectionId);
    if (!inspection) throw { status: 404, message: 'Inspection not found' };

    if (inspection.status !== 'PENDING_SETTLEMENT') {
        throw { status: 409, message: 'Inspection has no pending settlement or is already settled' };
    }

    // Find the active/recent contract for this room
    const contract = await Contract.findOne({
        where: {
            room_id: inspection.room_id,
            status: { [Op.in]: ['ACTIVE', 'EXPIRING_SOON', 'FINISHED'] }
        },
        order: [['created_at', 'DESC']]
    });

    if (!contract) {
        throw { status: 404, message: 'No active or recent contract found for this room' };
    }

    const oldDeposit = Number(contract.deposit_amount);
    const penalty = Number(inspection.penalty_total);
    const newDeposit = oldDeposit - penalty;

    const transaction = await sequelize.transaction();
    try {
        await contract.update({ deposit_amount: newDeposit }, { transaction });

        await AssetInspection.update(
            { status: 'SETTLED' },
            { where: { id: inspectionId }, transaction }
        );

        // Unassign all remaining assets from the room (check-out cleanup)
        const roomAssets = await Asset.findAll({
            where: { current_room_id: inspection.room_id },
            attributes: ['id']
        });
        if (roomAssets.length > 0) {
            await Asset.update(
                { current_room_id: null, status: 'AVAILABLE' },
                { where: { id: { [Op.in]: roomAssets.map(a => a.id) } }, transaction }
            );
        }

        await auditService.log({
            user,
            action: 'UPDATE',
            entityType: 'contract',
            entityId: contract.id,
            oldValue: { deposit_amount: oldDeposit },
            newValue: { deposit_amount: newDeposit, penalty_from_inspection: inspectionId },
        }, { transaction });

        await transaction.commit();

        return {
            inspection: { id: inspectionId, status: 'SETTLED', penalty_total: penalty },
            contract: {
                id: contract.id,
                contract_number: contract.contract_number,
                deposit_amount: newDeposit,
                deficit: newDeposit < 0
            }
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = { previewInspection, confirmInspection, settleInspection };
