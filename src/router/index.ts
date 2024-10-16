import express from "express";

import authentication from "./authentication";
import profile from "./profile";
import users from "./users";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  profile(router)
  users(router)
  
  return router;
};