require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

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
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/auth/internal', require('./routes/internalAuth.route'));
app.use('/api/users', require('./routes/adminUser.route'));
app.use('/api/service-types', require('./routes/serviceType.routes')); //
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/user-profile', require('./routes/userProfile.route'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
module.exports = app