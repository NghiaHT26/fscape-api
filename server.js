require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');

// Phase 1: Independent Tables
require('./models/location.model');
require('./models/facility.model');
require('./models/roomType.model');

// Phase 2: Core Tables
require('./models/university.model');
require('./models/building.model');
require('./models/user.model');

// Phase 3: Infrastructure & Profiles
require('./models/buildingImage.model');
require('./models/buildingFacility.model');
require('./models/room.model');
require('./models/authProvider.model');
require('./models/customerProfile.model');
require('./models/refreshToken.model');
require('./models/otpCode.model');
require('./models/contractTemplate.model');

// Phase 4: Room Details & Assets
require('./models/roomImage.model');
require('./models/asset.model');

// Phase 5: Business Core
require('./models/contract.model');
require('./models/assetHistory.model');

// Phase 6: Operational Tables
require('./models/contractExtension.model');
require('./models/invoice.model');
require('./models/booking.model');
require('./models/request.model');

// Phase 7: Financial & Activity Details
require('./models/invoiceItem.model');
require('./models/payment.model');
require('./models/requestImage.model');
require('./models/requestStatusHistory.model');

// Phase 9: System & Communications
require('./models/notification.model');
require('./models/notificationRecipient.model');
require('./models/auditLog.model');
require('./models/scheduledJob.model');
require('./models/emailTemplate.model');
require('./models/emailLog.model');

const models = sequelize.models;

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
    try {
        await sequelize.sync();
        console.log('✅ DB synced');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ DB Sync Error:', error);
    }
});