import pool from "../db";

export const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users")
  return result.rows;
}

export const getUserByEmail = async (email: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0];
}

export const getUserBySessionToken = async (sessionToken: string) => {
  const result = await pool.query("SELECT * FROM users WHERE (authentication).session_token = $1", [sessionToken])
  return result.rows;
}

export const getUserById = async (id: string) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
  return result.rows;
}

export const creatUser = async (values: Record<string, any>) => {
  const {
    username,
    email,
    password,
    salt = null,
    sessionToken = null, 
  } = values

  const result = await pool.query(
    "INSERT INTO users (username, email, authentication) VALUES ($1, $2, ROW($3, $4, $5)::authentication_type) RETURNING *",
    [username, email, password, salt, sessionToken]
  );
  return result.rows[0];
}

export const deleteUserById = async(id: string) => {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

export const updateUserById = async (id: string, values: Record<string, any>) => {
  const {
    username,
    email,
    password,
    salt = null,
    sessionToken = null, 
  } = values

  const result = await pool.query(
    "UPDATE users SET username = $2, email = $3, authentication = ROW($4, $5, $6)::authentication_type WHERE id = $1 RETURNING *",
    [id, username, email, password, salt, sessionToken]
  );
  return result.rows[0];
}