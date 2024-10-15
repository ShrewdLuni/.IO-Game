import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression"; 
import cors from "cors";
import router from "./router";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { BotData, PlayerData, ProjectileData } from "./types/PlayerTypes";
import { getUserByUsername } from "./models/users";
import { Game } from "./game";

const app = express();

app.use(cors({
  credentials: true,
}))

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api", router());

const port = 3000;

const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000});

const game = new Game(io);//game logic

app.use(express.static(path.join(__dirname, "../public")));

//routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

app.get("/leaderboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/leaderboard.html"));
});

app.get("/profile/:username", async (req, res) => {
  const username = req.params.username;

  if(await getUserByUsername(username) == null){
    res.sendFile(path.join(__dirname, "../public/pages/404.html"));
    return;
  }

  const filePath = path.join(__dirname, "../public/pages", "profile.html");
  let template = fs.readFileSync(filePath, "utf-8");
  res.send(template.replace(/{{name}}/g, username));
});

//run server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})