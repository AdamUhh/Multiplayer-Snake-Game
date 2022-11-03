// const io = require("socket.io")();

// io.on("connection", (client) => {
//   client.emit("init", { data: "hello world" });
// });

// io.listen(5501);

import { createServer } from "http";
import { Server } from "socket.io";
import { FRAME_RATE } from "./constants.js";
import { gameLoop, getUpdatedVelocity, initGame } from "./game.js";
import { makeId } from "./utils.js";

const state = {};
const clientRooms = {}; // ? look up the room name over a particular id

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
  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  async function handleJoinGame(roomName) {
    const room = await io.in(roomName).fetchSockets();

    let numClients = room.length;

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeId(5);

    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}

httpServer.listen(PORT);
