import pool from "../db";

interface Authentication {
  password: string;
  salt: string;
  sessionToken?: string;
}

interface User {
  id?: string;
  username: string;
  email: string;
  authentication: Authentication;
}

const parseAuthentication = (authString: string): Authentication => {
  const [password, salt, sessionToken] = authString.slice(1, -1).split(',');
  return {
    password: password.trim(),
    salt: salt.trim(),
    sessionToken: sessionToken.trim(),
  };
};

const mapUser = (row: any): User => {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    authentication: parseAuthentication(row.authentication),
  };
};

export const getUsers = async (): Promise<User[]> => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows.map(mapUser);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const getUserBySessionToken = async (sessionToken: string): Promise<User[]> => {
  const result = await pool.query("SELECT * FROM users WHERE (authentication).session_token = $1", [sessionToken]);
  return result.rows.map(mapUser);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const createUser = async (data: User): Promise<User> => {

  const result = await pool.query(
    "INSERT INTO users (username, email, authentication) VALUES ($1, $2, ROW($3, $4, $5)::authentication_type) RETURNING *",
    [data.username, data.email, data.authentication.password, data.authentication.salt, data.authentication.sessionToken]
  );
  return mapUser(result.rows[0]);
};

export const deleteUserById = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
};

export const updateUserById = async (id: string, data: User): Promise<User> => {
  const result = await pool.query(
    "UPDATE users SET username = $2, email = $3, authentication = ROW($4, $5, $6)::authentication_type WHERE user_id = $1 RETURNING *",
    [id, data.username, data.email, data.authentication.password, data.authentication.salt, data.authentication.sessionToken]
  );
  return mapUser(result.rows[0]);
};
