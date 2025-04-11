import { Cell, Position } from '../types/game';

export function generateMaze(size: number): Cell[][] {
  // Initialize the grid
  const maze: Cell[][] = Array(size).fill(null).map((_, y) => 
    Array(size).fill(null).map((_, x) => ({
      x,
      y,
      walls: { top: true, right: true, bottom: true, left: true },
      visited: false,
      hasCoin: false,
      hasTrap: false,
      isGoal: false,
    }))
  );

  // Start from a random cell
  const stack: Position[] = [];
  const start: Position = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
  maze[start.y][start.x].visited = true;
  stack.push(start);

  // Generate maze using depth-first search
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, maze, size);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    removeWalls(current, next, maze);
    maze[next.y][next.x].visited = true;
    stack.push(next);
  }

  // Add coins and traps
  const numCoins = Math.floor(size * size * 0.1); // 10% of cells have coins
  const numTraps = Math.floor(size * size * 0.05); // 5% of cells have traps

  // Set goal position (furthest from start)
  let maxDistance = 0;
  let goalPos = { x: size - 1, y: size - 1 };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.abs(x) + Math.abs(y);
      if (distance > maxDistance) {
        maxDistance = distance;
        goalPos = { x, y };
      }
    }
  }
  maze[goalPos.y][goalPos.x].isGoal = true;

  for (let i = 0; i < numCoins; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
    } while (
      maze[y][x].hasCoin || 
      maze[y][x].hasTrap || 
      maze[y][x].isGoal || 
      (x === 0 && y === 0)
    );
    maze[y][x].hasCoin = true;
  }

  for (let i = 0; i < numTraps; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * size);
      y = Math.floor(Math.random() * size);
    } while (
      maze[y][x].hasCoin || 
      maze[y][x].hasTrap || 
      maze[y][x].isGoal || 
      (x === 0 && y === 0)
    );
    maze[y][x].hasTrap = true;
  }

  return maze;
}

function getUnvisitedNeighbors(pos: Position, maze: Cell[][], size: number): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // top
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // bottom
    { x: -1, y: 0 }, // left
  ];

  for (const dir of directions) {
    const newX = pos.x + dir.x;
    const newY = pos.y + dir.y;

    if (newX >= 0 && newX < size && newY >= 0 && newY < size && !maze[newY][newX].visited) {
      neighbors.push({ x: newX, y: newY });
    }
  }

  return neighbors;
}

function removeWalls(current: Position, next: Position, maze: Cell[][]) {
  const dx = next.x - current.x;
  const dy = next.y - current.y;

  if (dx === 1) {
    maze[current.y][current.x].walls.right = false;
    maze[next.y][next.x].walls.left = false;
  } else if (dx === -1) {
    maze[current.y][current.x].walls.left = false;
    maze[next.y][next.x].walls.right = false;
  }

  if (dy === 1) {
    maze[current.y][current.x].walls.bottom = false;
    maze[next.y][next.x].walls.top = false;
  } else if (dy === -1) {
    maze[current.y][current.x].walls.top = false;
    maze[next.y][next.x].walls.bottom = false;
  }
}