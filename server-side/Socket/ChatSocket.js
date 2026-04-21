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
        // ✅ Input validation
        if (!senderId || !receiverId || !text || text.trim().length === 0 || text.length > 500) {
          return socket.emit("messageSent", { 
            text: "Invalid message. Keep it under 500 chars.", 
            senderId, 
            receiverId 
          });
        }

        const cleanText = text.trim();
        console.log(`Message from ${senderId}: ${cleanText}`);
        
        // Save user message
        const userMessage = await Message.create({
          senderId,
          receiverId,
message: cleanText
        });

        // Send back to sender
        socket.emit("messageSent", userMessage);

        // Send to receiver if online
        const receiverSocket = users[receiverId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", userMessage);
        }

        // ✅ AI auto-reply (simple, non-admin only)
        // AI auto-reply only for user→admin (admin manual msgs don't trigger AI)
        const adminUser = await User.findOne({ role: "admin" });
        if (receiverId.toString() === adminUser._id.toString() && senderId.toString() !== adminUser._id.toString()) {
          const aiText = await generateAIResponse(cleanText);
          const aiMessage = await Message.create({
            senderId: adminUser._id,
            receiverId: senderId,
            message: aiText
          });
          socket.emit("receiveMessage", aiMessage);
          console.log(`✅ AI replied to ${senderId}`);
        }

      } catch (err) {
        console.error("ChatSocket error:", err);
        socket.emit("messageSent", { 
          text: "Server error, please try again.", 
          senderId, 
          receiverId 
        });
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
