import express from "express";
import { createUser, getUserByEmail, updateUserByID } from "../models/users";

import { authentication, random } from "../helpers";
import { createUserStatistics, getUserStatisticsByID } from "../models/userStats";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.sendStatus(400);
    }

    const user = await getUserByEmail(email);

    if(!user) {
      return res.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if(user.authentication.password != expectedHash){
      return res.sendStatus(403);
    }

    const salt = random();

    user.authentication.sessionToken = authentication(salt, user.user_id!);
    await updateUserByID(user.user_id!, {username: user.username, email: user.email, authentication: {password: user.authentication.password ,salt: user.authentication.salt, sessionToken: user.authentication.sessionToken}})

    res.cookie("SHREWD-AUTH", user.authentication.sessionToken, {domain: "localhost", path: "/"});

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username} = req.body;

    if (!email || !password || !username){
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);

    if(existingUser){
      return res.sendStatus(400);
    }

    const salt = random();
    const user = await createUser({username: username, email: email, authentication: {password: authentication(salt, password), salt: salt}});

    let userStats = await getUserStatisticsByID(user.user_id!)
    if((userStats == null || userStats == undefined) && user.user_id != undefined){
      userStats = await createUserStatistics({user_id: user.user_id, kill_count: 0, death_count: 0, damage_dealed: 0, damage_absorbed: 0, time_in_game: 0});
    }

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}