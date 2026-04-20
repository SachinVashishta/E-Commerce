// sockets/chatSocket.js
const Message = require("../models/Message");
const { generateAIResponse } = require("../controllers/aiController");

let users = {}; // { userId: socketId }

const ChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // join user or admin
    socket.on("join", ({ userId }) => {
      users[userId] = socket.id;
    });

    // send message (user → admin OR admin → user)
    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        // Save user message
        const userMessage = await Message.create({
          senderId,
          receiverId,
          text,
        });

        // Send user message to admin/receiver (if admin connected)
        const receiverSocket = users[receiverId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", userMessage);
        }
        socket.emit("messageSent", userMessage);

        // If not from admin, generate AI response
        if (senderId !== "admin") {
          const aiText = await generateAIResponse(text);
          const aiMessage = await Message.create({
            senderId: "admin",
            receiverId: senderId,
            text: aiText,
          });

          // Send AI response back to user
          socket.emit("receiveMessage", aiMessage);

          // Send to admin if connected
          if (receiverSocket) {
            io.to(receiverSocket).emit("receiveMessage", aiMessage);
          }
        }

      } catch (err) {
        console.error("Chat error:", err);
        // Send error message to sender
        socket.emit("messageSent", {
          text: "Sorry, message sending failed.",
          senderId,
          receiverId,
        });
      }
    });

    socket.on("disconnect", () => {
      for (let id in users) {
        if (users[id] === socket.id) delete users[id];
      }
    });
  });
};

module.exports = ChatSocket;