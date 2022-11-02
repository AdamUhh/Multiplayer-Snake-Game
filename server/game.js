import { GRID_SIZE } from "./constants.js";

export function createGameState() {
  return {
    player: {
      pos: { x: 3, y: 10 },
      vel: { x: 1, y: 0 },
      snake: [
        { x: 1, y: 10 },
        { x: 2, y: 10 },
        { x: 3, y: 10 },
      ],
    },
    food: {
      x: 7,
      y: 7,
    },
    gridsize: GRID_SIZE,
    active: true,
  };
}

export function gameLoop(state) {
  if (!state) return;

  const playerOne = state.player;

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x > GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y > GRID_SIZE
  ) {
    return 2; // ? player 2 wins the game
  }

  // ? has player eaten food
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }

  // ? is player moving
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      // ? has snake bumped into itself (player 2 wins)
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  // ? no winner
  return false;
}

function randomFood(state) {
  let food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (let cell of state.player.snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }
  state.food = food;
}

export function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37:
      // ? ArrowLeft
      return { x: -1, y: 0 };
    case 38:
      // ? ArrowDown
      return { x: 0, y: -1 };
    case 39:
      // ? ArrowRight
      return { x: 1, y: 0 };
    case 40:
      // ? ArrowUp
      return { x: 0, y: 1 };

    default:
      break;
  }
}
