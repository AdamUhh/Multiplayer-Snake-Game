// const io = require("socket.io")();

// io.on("connection", (client) => {
//   client.emit("init", { data: "hello world" });
// });

// io.listen(5501);

import { createServer } from "http";
import { Server } from "socket.io";
import { createGameState, gameLoop, getUpdatedVelocity } from "./game.js";
import { FRAME_RATE } from "./constants.js";

const PORT = 5501;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    // ? its localhost so who cares about the wildcard, ami right
    // ? source: https://stackoverflow.com/questions/24058157/socket-io-node-js-cross-origin-request-blocked
    origin: "*",
  },
});

io.on("connection", (client) => {
  //   client.emit("init", { data: "hello world" });
  // ? Create a game state as soon as the client connects
  const state = createGameState();

  client.on("keydown", handleKeydown);

  function handleKeydown(keyCode) {
    try {
      keyCode = parseInt(keyCode);
    } catch (error) {
      console.error(error);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state.player.vel = vel;
    }
  }
  startGameInterval(client, state);
});

function startGameInterval(client, state) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state);

    if (!winner) {
      client.emit("gameState", JSON.stringify(state));
    } else {
      client.emit("gameOver");
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function winner(state) {}

httpServer.listen(PORT);
