require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables. Skipping admin seeding.');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding.');

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'admin' 
    });
    console.log(`Admin user created: ${adminEmail}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedAdmin();
