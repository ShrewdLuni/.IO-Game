import express from "express";

import { getProfileData } from "../controllers/profile";

export default (router: express.Router) => {
  router.get("/profile/:username", getProfileData);
};