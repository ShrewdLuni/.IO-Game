import pool from "./db";

async function testConnection() {
  try {
    const res = await pool.query("SELECT 1");
    console.log("Connection successful:", res.rows);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await pool.end();
    console.log("Pool has ended");
  }
}

testConnection();
