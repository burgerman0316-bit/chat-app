const express = require("express");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000; // ✅ works on Railway

const MESSAGES_FILE = path.join(__dirname, "messages.json");

// Load messages from file
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
    messages = JSON.parse(data);
  } catch (err) {
    console.error("Error reading messages.json:", err);
    messages = [];
  }
}

// Save messages to file
function saveMessages() {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// WebSocket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send chat history
  socket.emit("chat history", messages);

  socket.on("chat message", (msg) => {
    messages.push(msg);

    // keep only latest 200
    if (messages.length > 200) {
      messages.shift();
    }

    saveMessages();
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
