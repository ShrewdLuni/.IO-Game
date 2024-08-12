import pool from "../db";

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
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        authentication authentication_type NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        kill_count INTEGER DEFAULT 0,
        death_count INTEGER DEFAULT 0,
        damage_dealed INTEGER DEFAULT 0,
        damage_absorbed INTEGER DEFAULT 0,
        time_in_game INTEGER DEFAULT 0,
        PRIMARY KEY (user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_session_stats (
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        session_id SERIAL PRIMARY KEY,
        kill_count INTEGER DEFAULT 0,
        damage_dealed INTEGER DEFAULT 0,
        damage_absorbed INTEGER DEFAULT 0,
        time_in_session INTEGER DEFAULT 0,
        scoreboard_place INTEGER DEFAULT 0,
        CONSTRAINT unique_game_session UNIQUE (user_id, session_id)
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