const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, { cors: { origin: "*" } });

// Serve static files from public folder
app.use(express.static(__dirname + "/public"));

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("sendMessage", (msg) => {
        io.emit("newMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

http.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
