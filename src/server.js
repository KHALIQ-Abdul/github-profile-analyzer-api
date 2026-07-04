const app = require('./app');
const { port } = require('./config/env');
const { testConnection } = require('./config/db');

async function startServer() {
  try {
    await testConnection();
    console.log('✅ MySQL connected successfully');

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
