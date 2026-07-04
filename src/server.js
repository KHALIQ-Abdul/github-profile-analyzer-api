const app = require('./app');
const { port } = require('./config/env');
const { testConnection } = require('./config/db');
const { initDatabase } = require('./config/initDb');

async function startServer() {
  try {
    await testConnection();
    console.log('✅ MySQL connected successfully');

    await initDatabase();
    console.log('✅ Database table checked/created successfully');

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
