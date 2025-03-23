export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  hasCoin?: boolean;
  hasTrap?: boolean;
  isGoal?: boolean;
}

export interface GameState {
  player: Position;
  enemy?: Position;
  maze: Cell[][];
  score: number;
  gameOver: boolean;
  won: boolean;
  size: number;
  gamesWon: number;
  waterLevel: number;
  hasWaterHazard: boolean;
  hasEnemyHazard: boolean;
}