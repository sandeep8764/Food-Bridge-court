import app from './app.js';
import { testDatabaseConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDatabaseConnection();
  } catch (dbError) {
    console.warn('⚠️  MySQL Database connection warning:', dbError.message);
    console.warn('⚠️  Please ensure MySQL is running on port', process.env.DB_PORT || 3306);
  }

  app.listen(PORT, () => {
    console.log(`🚀 FoodBridge REST API running at http://localhost:${PORT}`);
  });
}

startServer();
