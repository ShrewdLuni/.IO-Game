import pool from "../db";

interface UserStatistics {
  user_id: number;
  kill_count: number;
  death_count: number;
  damage_dealed: number;
  damage_absorbed: number;
  time_in_game: number;
}

export const getAllUsersStatistics = async () : Promise<UserStatistics[]> => {
  const result = await pool.query("SELECT * FROM user_stats");
  return result.rows;
}

export const getUserStatisticsByID = async (id: string) : Promise<UserStatistics | null> => {
  const result = await pool.query("SELECT * FROM user_stats WHERE user_id = $1", [id]);
  return result.rows[0];
}

export const createUserStatistics = async (data: UserStatistics) => {
  const result = await pool.query(
    "INSERT INTO user_stats (user_id, kill_count, death_count, damage_dealed, damage_absorbed, time_in_game) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [data.user_id, data.kill_count, data.death_count, data.damage_dealed, data.damage_absorbed, data.time_in_game]
  );
  return result.rows[0];
}

export const updateUserStatisticsByID = async (id: string, data: UserStatistics): Promise<UserStatistics> => {
  const result = await pool.query(
    "UPDATE user_stats SET kill_count = $2, death_count = $3, damage_dealed = $4, damage_absorbed = $5, time_in_game = $6 WHERE user_id = $1 RETURNING *",
    [id, data.kill_count, data.death_count, data.damage_dealed, data.damage_absorbed, data.time_in_game]
  );
  return result.rows[0];
};

export const deleteUserStatisticsByID = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM user_stats WHERE user_id = $1", [id]);
};