import { useEffect, useState } from 'react';
import { Direction, Position } from '../types/game';
import { generateMaze } from '../utils/mazeGenerator';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Heart } from 'lucide-react-native';

export default function MazeGame() {
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [mazeSize, setMazeSize] = useState({ width: 15, height: 15 });

  useEffect(() => {
    const newMaze = generateMaze(mazeSize.height, mazeSize.width);
    setMaze(newMaze);
    setPlayerPosition({ x: 1, y: 1 });
    setGameWon(false);
  }, [mazeSize]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameWon) return;

      switch (e.key) {
        case 'ArrowUp':
          movePlayer('up');
          break;
        case 'ArrowDown':
          movePlayer('down');
          break;
        case 'ArrowLeft':
          movePlayer('left');
          break;
        case 'ArrowRight':
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, maze, gameWon]);

  const movePlayer = (direction: Direction) => {
    if (gameWon) return;

    const newPosition = { ...playerPosition };

    switch (direction) {
      case 'up':
        newPosition.y -= 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
    }

    if (
      newPosition.x >= 0 &&
      newPosition.x < maze[0].length &&
      newPosition.y >= 0 &&
      newPosition.y < maze.length &&
      maze[newPosition.y][newPosition.x] !== 1
    ) {
      setPlayerPosition(newPosition);

      if (
        newPosition.x === maze[0].length - 2 &&
        newPosition.y === maze.length - 2
      ) {
        setGameWon(true);
      }
    }
  };

  const resetGame = () => {
    const newMaze = generateMaze(mazeSize.height, mazeSize.width);
    setMaze(newMaze);
    setPlayerPosition({ x: 1, y: 1 });
    setGameWon(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Maze Game</h1>
        
        {gameWon && (
          <div className="text-center mb-4">
            <p className="text-xl font-bold text-green-600 mb-2">Congratulations! You won!</p>
            <button
              onClick={resetGame}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="relative bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid gap-0.5" style={{ fontSize: '0' }}>
            {maze.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] md:w-[30px] md:h-[30px] ${
                      cell === 1
                        ? 'bg-gray-800'
                        : x === playerPosition.x && y === playerPosition.y
                        ? 'bg-blue-500'
                        : x === maze[0].length - 2 && y === maze.length - 2
                        ? 'bg-green-500'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Touch Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          <div className="col-start-2">
            <button
              onClick={() => movePlayer('up')}
              className="w-full bg-gray-200 p-4 rounded-lg active:bg-gray-300 flex items-center justify-center"
              aria-label="Move Up"
            >
              <ChevronUp className="w-8 h-8" />
            </button>
          </div>
          <div className="col-start-1 col-span-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => movePlayer('left')}
              className="w-full bg-gray-200 p-4 rounded-lg active:bg-gray-300 flex items-center justify-center"
              aria-label="Move Left"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={() => movePlayer('down')}
              className="w-full bg-gray-200 p-4 rounded-lg active:bg-gray-300 flex items-center justify-center"
              aria-label="Move Down"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
            <button
              onClick={() => movePlayer('right')}
              className="w-full bg-gray-200 p-4 rounded-lg active:bg-gray-300 flex items-center justify-center"
              aria-label="Move Right"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          Use arrow keys or touch controls to move
        </div>

        {/* Footer with credit */}
        <div className="text-center mt-8 text-sm text-gray-600 flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Sruthi
        </div>
      </div>
    </div>
  );
}