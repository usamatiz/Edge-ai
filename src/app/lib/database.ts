import dbConnect from './mongodb';

/**
 * Initialize database connection
 * This should be called once at application startup
 */
export async function initializeDatabase() {
  try {
    await dbConnect();
    console.log('✅ Database connected successfully');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('whitelist')) {
      console.error('💡 Solution: Add your IP address to MongoDB Atlas Network Access whitelist');
      console.error('   Or use 0.0.0.0/0 for development (not recommended for production)');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Solution: Check your MONGODB_URI username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Solution: Check your MONGODB_URI connection string');
    }
    
    throw error;
  }
}

/**
 * Close database connection (useful for testing or graceful shutdown)
 */
export async function closeDatabase() {
  try {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}
