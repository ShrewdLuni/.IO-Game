import express from "express";
import { getUserByUsername } from "../models/users";
import { getUserStatisticsByID } from "../models/userStats";

export const getProfileData = async(req: express.Request, res: express.Response) => {
  try {
    const { username } = req.params;

    if(!username){
      return res.sendStatus(400);
    }

    const user = await getUserByUsername(username);

    if(!user || !user.user_id) {
      return res.sendStatus(400);
    }

    const userStats = await getUserStatisticsByID(user.user_id)

    if(!userStats){
      return res.sendStatus(400);
    }
    
    const profileData = {username: user.username,userStats: userStats}
    console.log(profileData);
    return res.status(200).json(profileData).end();
  } catch (error) {
    console.log(error);
    return res.status(400)
  }
}