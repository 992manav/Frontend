import { io } from "socket.io-client";

const socket = io("https://jeevanya-front-alpha.vercel.app", {
  transports: ["websocket"], // Ensures WebSocket connection
});

export default socket;
