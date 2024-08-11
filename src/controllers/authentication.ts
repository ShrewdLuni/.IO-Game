import express from "express";
import { createUser, getUserByEmail, updateUserById } from "../models/users";
import { authentication, random } from "../helpers";

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
    console.log(2, user.authentication.salt, password, expectedHash)
    if(user.authentication.password != expectedHash){
      return res.sendStatus(403);
    }

    const salt = random();

    user.authentication.sessionToken = authentication(salt, user.id!);
    await updateUserById(user.id!, {username: user.username, email: user.email, authentication: {password: user.authentication.password ,salt: user.authentication.salt, sessionToken: user.authentication.sessionToken}})

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
    console.log(1,salt,password,authentication(salt, password))
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}