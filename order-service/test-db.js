const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');
    console.log('📊 Database:', mongoose.connection.name);
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối');
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
  }
}

testConnection();