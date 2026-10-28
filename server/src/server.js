import app from './app.js';
import { testDatabaseConnection } from './config/db.js';

const PORT = Number(process.env.PORT) || 5001;

async function startServer() {
  try {
    await testDatabaseConnection();
  } catch (dbError) {
    console.warn('⚠️  MySQL Database connection warning:', dbError.message);
    console.warn('⚠️  Please ensure MySQL is running on port', process.env.DB_PORT || 3306);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FoodBridge REST API running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
