import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Position } from '../types/game';
import { generateMaze } from '../utils/mazeGenerator';
import { Coins, Skull, Trophy } from 'lucide-react';

const CELL_SIZE = 40;
const PLAYER_SIZE = 20;
const MAZE_SIZE = 10;
const WATER_RISE_SPEED = 0.5; // percentage per second
const ENEMY_MOVE_INTERVAL = 1000; // ms

export default function MazeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    player: { x: 0, y: 0 },
    maze: generateMaze(MAZE_SIZE),
    score: 0,
    gameOver: false,
    won: false,
    size: MAZE_SIZE,
    gamesWon: 0,
    waterLevel: 0,
    hasWaterHazard: false,
    hasEnemyHazard: false,
  });
  const [showTraps, setShowTraps] = useState(true);

  // Blink traps every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTraps(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Water level rise
  useEffect(() => {
    if (!gameState.hasWaterHazard || gameState.gameOver || gameState.won) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newWaterLevel = prev.waterLevel + WATER_RISE_SPEED;
        if (newWaterLevel >= 100) {
          return { ...prev, gameOver: true };
        }
        return { ...prev, waterLevel: newWaterLevel };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.hasWaterHazard, gameState.gameOver, gameState.won]);

  // Enemy movement
  useEffect(() => {
    if (!gameState.hasEnemyHazard || gameState.gameOver || gameState.won || !gameState.enemy) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev.enemy) return prev;

        const dx = prev.player.x - prev.enemy.x;
        const dy = prev.player.y - prev.enemy.y;

        let newX = prev.enemy.x;
        let newY = prev.enemy.y;

        // Move enemy towards player
        if (Math.abs(dx) > Math.abs(dy)) {
          newX += Math.sign(dx);
        } else {
          newY += Math.sign(dy);
        }

        // Check if enemy caught player
        if (newX === prev.player.x && newY === prev.player.y) {
          return { ...prev, gameOver: true };
        }

        return { ...prev, enemy: { x: newX, y: newY } };
      });
    }, ENEMY_MOVE_INTERVAL);

    return () => clearInterval(interval);
  }, [gameState.hasEnemyHazard, gameState.gameOver, gameState.won]);

  const resetGame = useCallback(() => {
    const newMaze = generateMaze(MAZE_SIZE);
    const gamesWon = gameState.gamesWon + (gameState.won ? 1 : 0);
    
    // Add hazards based on games won
    const hasWaterHazard = gamesWon >= 5;
    const hasEnemyHazard = gamesWon >= 10;
    
    setGameState({
      player: { x: 0, y: 0 },
      enemy: hasEnemyHazard ? { x: MAZE_SIZE - 1, y: MAZE_SIZE - 1 } : undefined,
      maze: newMaze,
      score: gameState.won ? gameState.score : 0, // Keep score if won, reset if lost
      gameOver: false,
      won: false,
      size: MAZE_SIZE,
      gamesWon,
      waterLevel: 0,
      hasWaterHazard,
      hasEnemyHazard,
    });
  }, [gameState.won, gameState.gamesWon, gameState.score]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.gameOver || prev.won) return prev;

      const newX = prev.player.x + dx;
      const newY = prev.player.y + dy;

      // Check bounds
      if (newX < 0 || newX >= prev.size || newY < 0 || newY >= prev.size) {
        return prev;
      }

      // Check walls
      const currentCell = prev.maze[prev.player.y][prev.player.x];
      if (
        (dx === 1 && currentCell.walls.right) ||
        (dx === -1 && currentCell.walls.left) ||
        (dy === 1 && currentCell.walls.bottom) ||
        (dy === -1 && currentCell.walls.top)
      ) {
        return prev;
      }

      const newCell = prev.maze[newY][newX];
      let newScore = prev.score;
      let gameOver = prev.gameOver;
      let won = prev.won;

      // Collect coin
      if (newCell.hasCoin) {
        newScore += 1; // 1 point per coin
        newCell.hasCoin = false;
      }

      // Check trap
      if (newCell.hasTrap && showTraps) {
        gameOver = true;
      }

      // Check goal
      if (newCell.isGoal) {
        won = true;
        newScore += 5; // 5 points for winning
      }

      // Check enemy collision
      if (prev.enemy && newX === prev.enemy.x && newY === prev.enemy.y) {
        gameOver = true;
      }

      return {
        ...prev,
        player: { x: newX, y: newY },
        score: newScore,
        gameOver,
        won,
        maze: [...prev.maze],
      };
    });
  }, [showTraps]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
          movePlayer(1, 0);
          break;
        case 'ArrowDown':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
          movePlayer(-1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    gameState.maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;

        // Draw walls
        ctx.beginPath();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;

        if (cell.walls.top) {
          ctx.moveTo(cellX, cellY);
          ctx.lineTo(cellX + CELL_SIZE, cellY);
        }
        if (cell.walls.right) {
          ctx.moveTo(cellX + CELL_SIZE, cellY);
          ctx.lineTo(cellX + CELL_SIZE, cellY + CELL_SIZE);
        }
        if (cell.walls.bottom) {
          ctx.moveTo(cellX, cellY + CELL_SIZE);
          ctx.lineTo(cellX + CELL_SIZE, cellY + CELL_SIZE);
        }
        if (cell.walls.left) {
          ctx.moveTo(cellX, cellY);
          ctx.lineTo(cellX, cellY + CELL_SIZE);
        }
        ctx.stroke();

        // Draw goal
        if (cell.isGoal) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(
            cellX + CELL_SIZE * 0.2,
            cellY + CELL_SIZE * 0.2,
            CELL_SIZE * 0.6,
            CELL_SIZE * 0.6
          );
        }

        // Draw coins
        if (cell.hasCoin) {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Draw traps
        if (cell.hasTrap && showTraps) {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            8,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
    });

    // Draw water level if active
    if (gameState.hasWaterHazard) {
      const waterHeight = (canvas.height * gameState.waterLevel) / 100;
      ctx.fillStyle = 'rgba(0, 127, 255, 0.3)';
      ctx.fillRect(0, canvas.height - waterHeight, canvas.width, waterHeight);
    }

    // Draw enemy if active
    if (gameState.enemy) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        gameState.enemy.x * CELL_SIZE + CELL_SIZE / 2,
        gameState.enemy.y * CELL_SIZE + CELL_SIZE / 2,
        PLAYER_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw player
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(
      gameState.player.x * CELL_SIZE + CELL_SIZE / 2,
      gameState.player.y * CELL_SIZE + CELL_SIZE / 2,
      PLAYER_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [gameState, showTraps]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-500" />
              <span className="text-xl font-bold">Score: {gameState.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="text-blue-500" />
              <span className="text-xl font-bold">Wins: {gameState.gamesWon}</span>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            New Game
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={CELL_SIZE * MAZE_SIZE}
          height={CELL_SIZE * MAZE_SIZE}
          className="border-2 border-gray-200 rounded"
        />

        {(gameState.gameOver || gameState.won) && (
          <div className="mt-4 text-center">
            {gameState.gameOver ? (
              <div className="flex items-center justify-center gap-2 text-red-500">
                <Skull />
                <span className="text-xl font-bold">Game Over!</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-green-500">
                You Won! 🎉 (+5 points)
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <div>Use arrow keys to move the player</div>
          {gameState.hasWaterHazard && (
            <div className="text-blue-500">Water is rising! Hurry up!</div>
          )}
          {gameState.hasEnemyHazard && (
            <div className="text-red-500">Watch out for the enemy!</div>
          )}
        </div>
      </div>
    </div>
  );
}