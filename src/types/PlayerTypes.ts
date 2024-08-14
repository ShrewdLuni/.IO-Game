type Stats = {
  regeneration: number;
  maxHealth: number;
  bulletSpeed: number;
  damage: number;
  shootingSpeed: number;
  rotationSpeed: number;
  speed: number;
};

type CurrentState = {
  health: number;
  lastRegeneration: number;
  lastShot: number;
  score: number;
};

type PlayerData = {
  position: {x: number; y: number};
  rotation: number;
  targetRotation: number;
  username: string;
  stats: Stats;
  currentState: CurrentState;
};

type ProjectileData = {
  position: {x: number; y: number}; 
  velocity: {x: number; y: number}; 
  playerID: string; 
  timestamp: number;
}

type BotData = {
 currentState: "Patrol" | "Chase" | "Flee";
 lastPositionUpdate: number;
}

export { PlayerData, ProjectileData, BotData }