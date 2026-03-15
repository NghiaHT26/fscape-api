require('dotenv').config();
const { sequelize } = require('./config/db');

async function fix() {
  try {
    await sequelize.query('ALTER TABLE assets ALTER COLUMN building_id DROP NOT NULL;');
    console.log('Successfully removed NOT NULL constraint from assets.building_id');
    process.exit(0);
  } catch (err) {
    console.error('Error altering table:', err);
    process.exit(1);
  }
}

fix();
