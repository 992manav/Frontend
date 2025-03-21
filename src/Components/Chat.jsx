import React, { useEffect, useState } from "react";
import socket from "./Socketio.js";
import axios from "axios";

const Chat = ({ receiver, sender }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Fetch previous chat history
    axios
      .get(`https://jeevanya-back.vercel.app/api/chat/${sender}/${receiver}`)
      .then((res) => setMessages(res.data));

    socket.on("receiveMessage", (message) => {
      console.log("hua");
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off("receiveMessage");
  }, [sender, receiver]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = { sender, receiver, message: newMessage };
    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  return (
    <div className="p-5 border-2 border-black rounded-lg shadow-sm bg-[#DDEBFE]">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-4">
        Chat
      </h2>
      <div className="h-80 overflow-y-auto p-3 border border-black rounded-lg bg-white mb-4">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`p-3 rounded-lg max-w-[50%] mb-3 ${
              msg.sender === sender
                ? "ml-auto bg-blue-400 border-2 border-black text-gray-800" // Sender's message
                : "mr-auto bg-blue-100 border-2 border-black text-gray-800" // Receiver's message
            }`}
          >
            {msg.message}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-50 text-black rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
