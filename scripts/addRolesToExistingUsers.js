const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import User model (CommonJS compatible)
const userSchemaDefinition = require('../models/User.js');

async function migrate() {
  try {
    console.log('🚀 Starting migration...');
    console.log('📦 Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get User model
    const User = mongoose.models.User || mongoose.model('User', userSchemaDefinition.default.schema);

    // Count users without role
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    console.log(`📊 Found ${usersWithoutRole} users without role field`);

    if (usersWithoutRole === 0) {
      console.log('✨ All users already have roles. Nothing to migrate.');
      process.exit(0);
    }

    // Update all existing users without role to 'client' by default
    const result = await User.updateMany(
      { role: { $exists: false } },
      {
        $set: {
          role: 'client',
          profileComplete: false,
          onlineStatus: false,
          lastSeen: new Date(),
          rating: 0,
          reviewCount: 0,
          skills: [],
          bio: ''
        }
      }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   - Users updated: ${result.modifiedCount}`);
    console.log(`   - Default role: client`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Users can change their role in the Settings page`);
    console.log(`   2. Set specific users as 'freelancer' or 'admin' manually if needed`);

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrate();
