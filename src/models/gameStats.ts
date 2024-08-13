import pool from "../db";

interface GameSessionStatistics {
  user_id: string;
  session_id?: number;
  kill_count: number;
  damage_dealed: number;
  damage_absorbed: number;
  time_in_session: number;
  scoreboard_place: number;
}

export const getAllGames = async () : Promise<GameSessionStatistics[]> => {
  const result = await pool.query("SELECT * FROM game_session_stats");
  return result.rows;
}

export const getGameStatisticsByGameID = async (id: string) : Promise<GameSessionStatistics | null> => {
  const result = await pool.query("SELECT * FROM game_session_stats WHERE session_id = $1", [id]);
  return result.rows[0];
}

export const getGameStatisticsByUserID = async (id: string) : Promise<GameSessionStatistics[]> => {
  const result = await pool.query("SELECT * FROM game_session_stats WHERE user_id = $1", [id]);
  return result.rows;
}

export const createGameStatistics = async (data: GameSessionStatistics): Promise<GameSessionStatistics> => {
  const result = await pool.query(
    "INSERT INTO game_session_stats (user_id, kill_count, damage_dealed, damage_absorbed, time_in_session, scoreboard_place) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [data.user_id, data.kill_count, data.damage_dealed, data.damage_absorbed, data.time_in_session, data.scoreboard_place]
  );
  return result.rows[0];
};

export const updateGameStatisticsByID = async (id: string, data: GameSessionStatistics): Promise<GameSessionStatistics> => {
  const result = await pool.query(
    "UPDATE game_session_stats SET kill_count = $2, damage_dealed = $3, damage_absorbed = $4, time_in_session = $5, scoreboard_place = $6 WHERE session_id = $1 RETURNING *",
    [id, data.kill_count, data.damage_dealed, data.damage_absorbed, data.time_in_session, data.scoreboard_place]
  );
  return result.rows[0];
};

export const deleteGameStatisticsByID = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM game_session_stats WHERE session_id = $1", [id]);
};