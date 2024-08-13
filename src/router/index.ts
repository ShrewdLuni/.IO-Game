import express from "express";

import authentication from "./authentication";
import profile from "./profile";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  profile(router)
  
  return router;
};