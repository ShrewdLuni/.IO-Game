import pool from "../db";

interface GameSessionStatistics {
  user_id: number;
  game_session_id: number;
  session_kill_count: number;
  session_damage_dealed: number;
  session_damage_absorbed: number;
  time_in_session: number;
  best_scoreboard_place: number;
}

export const getAllGames = async () : Promise<GameSessionStatistics[]> => {
  const result = await pool.query("SELECT * FROM game_session_stats");
  return result.rows;
}

export const getGameStatisticsByGameID = async (id: string) : Promise<GameSessionStatistics | null> => {
  const result = await pool.query("SELECT * FROM game_session_stats WHERE game_session_id = $1", [id]);
  return result.rows[0];
}

export const getUserGameStatistics = async (id: string) : Promise<GameSessionStatistics[]> => {
  const result = await pool.query("SELECT * FROM game_session_stats WHERE user_id = $1", [id]);
  return result.rows;
}