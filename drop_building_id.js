require('dotenv').config();
const { sequelize } = require('./config/db');

async function dropBuildingId() {
  try {
    await sequelize.query('ALTER TABLE assets DROP COLUMN IF EXISTS building_id CASCADE;');
    console.log('Successfully dropped building_id from assets');
    process.exit(0);
  } catch (err) {
    console.error('Error altering table:', err);
    process.exit(1);
  }
}

dropBuildingId();
