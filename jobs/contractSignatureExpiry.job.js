const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const run = async () => {
    const { Contract, Booking, Room, ScheduledJob } = sequelize.models;

    const job = await ScheduledJob.create({
        job_name: 'contract_signature_expiry',
        job_type: 'CRON',
        status: 'RUNNING',
        started_at: new Date()
    });

    try {
        const expiredContracts = await Contract.findAll({
            where: {
                status: { [Op.in]: ['PENDING_CUSTOMER_SIGNATURE', 'PENDING_MANAGER_SIGNATURE'] },
                signature_expires_at: { [Op.lt]: new Date() }
            }
        });

        let processed = 0;

        for (const contract of expiredContracts) {
            const transaction = await sequelize.transaction();
            try {
                await contract.update({
                    status: 'CANCELLED',
                    signature_expires_at: null
                }, { transaction });

                const booking = await Booking.findOne({
                    where: { contract_id: contract.id },
                    transaction
                });

                if (booking) {
                    await booking.update({
                        status: 'CANCELLED',
                        cancelled_at: new Date(),
                        cancellation_reason: 'Hợp đồng hết hạn ký'
                    }, { transaction });

                    await Room.update(
                        { status: 'AVAILABLE' },
                        { where: { id: booking.room_id }, transaction }
                    );
                }

                await transaction.commit();
                processed++;
                console.log(`[ContractExpiryJob] Cancelled contract ${contract.contract_number} (was ${contract.status})`);
            } catch (err) {
                await transaction.rollback();
                console.error(`[ContractExpiryJob] Failed to cancel contract ${contract.id}:`, err.message);
            }
        }

        await job.update({
            status: 'COMPLETED',
            completed_at: new Date(),
            records_processed: processed
        });

        if (processed > 0) {
            console.log(`[ContractExpiryJob] Completed: ${processed} contract(s) cancelled`);
        }
    } catch (err) {
        await job.update({
            status: 'FAILED',
            completed_at: new Date(),
            error_message: err.message
        });
        console.error('[ContractExpiryJob] Job failed:', err.message);
    }
};

module.exports = { run };
