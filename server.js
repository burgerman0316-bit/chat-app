const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Message storage file
const messagesFile = path.join(__dirname, "messages.json");
let messages = [];

// Load messages from file if exists
if (fs.existsSync(messagesFile)) {
  const data = fs.readFileSync(messagesFile, "utf8");
  try {
    messages = JSON.parse(data);
  } catch (err) {
    console.error("Error parsing messages.json:", err);
    messages = [];
  }
}

// Save messages to file
function saveMessages() {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

// Socket.io
io.on("connection", (socket) => {
  console.log("User connected");

  // Send old messages to new user
  socket.emit("chat history", messages);

  // Listen for messages
  socket.on("chat message", (msg) => {
    messages.push(msg);

    // Keep only last 200 messages
    if (messages.length > 200) {
      messages.shift();
    }

    saveMessages();
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
