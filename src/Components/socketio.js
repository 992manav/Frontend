import { io } from "socket.io-client";

const socket = io("https://backend-g51b.onrender.com", {
  transports: ["websocket"], // Ensures WebSocket connection
});

export default socket;
