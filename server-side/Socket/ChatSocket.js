// sockets/chatSocket.js
const Message = require("../models/Message");
const { generateAIResponse } = require("../controllers/aiController");
const mongoose = require('mongoose');

let users = {}; // { userId: socketId }

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    // Join room - store socket mapping
    socket.on("join", ({ userId }) => {
      users[userId] = socket.id;
      socket.join(userId);
      console.log(`User ${userId} joined`);
    });

    // Send message
    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        console.log(`Message from ${senderId}: ${text}`);
        
        // Save user message (adminId as string ok, Mongo stores as ObjectId or string)
        const userMessage = await Message.create({
          senderId,
          receiverId,
          text
        });

        // Send to receiver
        const receiverSocket = users[receiverId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", userMessage);
        }
        socket.emit("messageSent", userMessage);

        // AI auto-reply if not from admin
        if (senderId !== "admin") {
          const aiText = await generateAIResponse(text);
          const aiMessage = await Message.create({
            senderId: "admin",
            receiverId: senderId,
            text: aiText
          });

          socket.emit("receiveMessage", aiMessage);
          if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", aiMessage);
          }
          console.log(`AI replied to ${senderId}`);
        }

      } catch (err) {
        console.error("ChatSocket error:", err);
        socket.emit("messageSent", { text: "Sorry, try again.", senderId, receiverId });
      }
    });

    socket.on("disconnect", () => {
      for (let id in users) {
        if (users[id] === socket.id) {
          delete users[id];
          console.log(`User ${id} disconnected`);
        }
      }
    });
  });
};
