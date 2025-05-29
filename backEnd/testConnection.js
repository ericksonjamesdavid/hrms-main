import { testConnection, initializeDatabase } from "./config/database.js";

async function runDatabaseTest() {
  console.log("🧪 Running Database Connection Test");
  console.log("=" * 40);

  try {
    // Test connection
    const isConnected = await testConnection();

    if (isConnected) {
      console.log("\n🏗️  Testing database initialization...");
      const isInitialized = await initializeDatabase();

      if (isInitialized) {
        console.log("\n🎉 All database tests passed!");
      } else {
        console.log("\n❌ Database initialization failed");
      }
    } else {
      console.log("\n❌ Database connection test failed");
    }
  } catch (error) {
    console.error("\n💥 Test failed with error:", error.message);
  }

  console.log("\n" + "=" * 40);
  process.exit(0);
}

runDatabaseTest();
