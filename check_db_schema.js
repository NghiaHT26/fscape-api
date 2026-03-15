require('dotenv').config();
const { sequelize } = require('./config/db');

async function check() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'assets' AND column_name = 'building_id';
    `);
    console.log('Column Building ID info:', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
