require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  const StaffSchema = new mongoose.Schema({ username: String, discordUsername: String, email: String, password: String, name: String, role: String, department: String, status: String }, { timestamps: true });
  const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);

  const exists = await Staff.findOne({ username: 'staff' }).lean();
  if (exists) {
    console.log('Seed user already exists, skipping.');
    process.exit(0);
  }

  const hash = await bcrypt.hash('staff1921', 10);
  await Staff.create({ username: 'staff', discordUsername: 'StaffCrew#0003', email: 'staff@singaporeairlines.com', password: hash, name: 'Staff User', role: 'staff', department: 'Crew', status: 'active' });
  console.log('Seeded staff user');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
