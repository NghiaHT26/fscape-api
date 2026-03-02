require('dotenv').config()
const setupSwagger = require('./setups/swaggerSetup');

const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
setupSwagger(app);

// ─── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ─── Routes ────────────────────────────────────────────────
app.use('/api/rooms', require('./routes/room.routes'))
app.use('/api/room-types', require('./routes/roomType.routes'))
app.use('/api/assets', require('./routes/asset.routes'))
app.use('/api/locations', require('./routes/location.routes'));     //
app.use('/api/universities', require('./routes/university.routes')); //
app.use('/api/buildings', require('./routes/building.routes'));      //
app.use('/api/facilities', require('./routes/facility.routes'));     //
app.use('/api/building-facilities', require('./routes/buildingFacility.routes')); //
app.use('/api/auth/internal', require('./routes/internalAuth.route'));
app.use('/api/admin/users', require('./routes/adminUser.route'));
app.use('/api/service-types', require('./routes/serviceType.routes')); //
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/user-profile', require('./routes/userProfile.route'));
module.exports = app