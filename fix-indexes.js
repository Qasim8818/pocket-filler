const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pocket-filerrr');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('associates');
    
    // Drop the problematic indexes
    try {
      await collection.dropIndex('invitationCode_1');
      console.log('Dropped invitationCode_1 index');
    } catch (e) {
      console.log('invitationCode_1 index not found:', e.message);
    }
    
    try {
      await collection.dropIndex('verificationCode_1');
      console.log('Dropped verificationCode_1 index');
    } catch (e) {
      console.log('verificationCode_1 index not found:', e.message);
    }
    
    // Create new sparse indexes
    await collection.createIndex({ invitationCode: 1 }, { unique: true, sparse: true });
    console.log('Created sparse invitationCode index');
    
    await collection.createIndex({ verificationCode: 1 }, { unique: true, sparse: true });
    console.log('Created sparse verificationCode index');
    
    console.log('Indexes fixed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
