import pool from "../db";

import { getAllGames, getGameStatisticsByGameID, getGameStatisticsByUserID, createGameStatistics, updateGameStatisticsByID, deleteGameStatisticsByID } from "../models/gameStats";
import { getAllUsersStatistics, getUserStatisticsByID, createUserStatistics, updateUserStatisticsByID, deleteUserStatisticsByID } from "../models/userStats"

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

async function testGameStats(){
  try {
    console.log(1, await getAllGames());
    console.log(2, await createGameStatistics({user_id: 1,kill_count:1,damage_absorbed:0,damage_dealed:100,scoreboard_place:2,time_in_session:100}))
    console.log(3, await createGameStatistics({user_id: 1,kill_count:3,damage_absorbed:15,damage_dealed:300,scoreboard_place:1,time_in_session:200}))
    console.log(4, await getAllGames())
    console.log(5, await getGameStatisticsByGameID("8"))
    console.log(6, await getGameStatisticsByGameID("7"))
    console.log(7, await getGameStatisticsByUserID("1"))
    console.log(8, await updateGameStatisticsByID("8",{user_id: 1,kill_count:8,damage_absorbed:255,damage_dealed:30077,scoreboard_place:1,time_in_session:200}))
    console.log(9, await getAllGames());
    console.log(10, await deleteGameStatisticsByID("7"));
    console.log(11, await getAllGames());
  } catch (error) {
    console.error(error)
  }
}

async function testUserStats(){
  try {
    console.log(1, await getAllUsersStatistics());
    console.log(2, await createUserStatistics({user_id: 1, kill_count: 7, death_count: 5, damage_dealed: 900, damage_absorbed: 1050, time_in_game: 157890}))
    console.log(3, await updateUserStatisticsByID("1", {user_id: 1, kill_count: 15, death_count: 8, damage_dealed: 900, damage_absorbed: 1050, time_in_game: 157890}))
    console.log(4, await deleteUserStatisticsByID("1"));
    console.log(5, await getAllUsersStatistics())
    console.log(6, await createUserStatistics({user_id: 1, kill_count: 3, death_count: 5, damage_dealed: 1234, damage_absorbed: 612, time_in_game: 6234}))
    console.log(7, await createUserStatistics({user_id: 2, kill_count: 6, death_count: 2, damage_dealed: 432, damage_absorbed: 62, time_in_game: 14456}))
    console.log(8, await getAllUsersStatistics())
    console.log(9, await getUserStatisticsByID("3"))
  } catch (error) {
    console.error(error)
  }
}

// testConnection();
testGameStats();
testUserStats();