import pool from "../db"

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TYPE authentication_type AS (
        password VARCHAR(100),
        salt VARCHAR(255),
        session_token VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        authentication authentication_type NOT NULL
      );
    `);

    console.log('Database setup complete.');
  } catch (err) {
    console.error('Error setting up the database:', err);
  } finally {
    client.release();
  }
};

setupDatabase();