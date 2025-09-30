const socket = io();

const messagesContainer = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const loginBtn = document.getElementById("loginBtn");

let currentUser = null;

// Google Login
loginBtn.onclick = () => {
  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  google.accounts.id.prompt();
};

function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  currentUser = {
    name: data.name,
    email: data.email,
    picture: data.picture
  };
  loginBtn.style.display = "none"; // hide login button
}

// Decode JWT token
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")
  );
  return JSON.parse(jsonPayload);
}

// Add message to chat
function addMessage(username, content, timestamp, picture, isOwn = false) {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${isOwn ? "own" : ""}`;

  if (picture) {
    const img = document.createElement("img");
    img.src = picture;
    img.alt = username;
    msgEl.appendChild(img);
  }

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "content";

  const header = document.createElement("div");
  header.className = "message-header";
  const time = new Date(timestamp);
  header.textContent = `${username} - ${time.toLocaleTimeString()}`;

  const body = document.createElement("div");
  body.textContent = content;

  contentWrapper.appendChild(header);
  contentWrapper.appendChild(body);

  msgEl.appendChild(contentWrapper);
  messagesContainer.appendChild(msgEl);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value && currentUser) {
    const messageData = {
      username: currentUser.name,
      picture: currentUser.picture,
      content: input.value,
      timestamp: new Date()
    };
    socket.emit("chat message", messageData);
    input.value = "";
  }
});

// Receive old messages
socket.on("chat history", (history) => {
  history.forEach(msg =>
    addMessage(msg.username, msg.content, msg.timestamp, msg.picture)
  );
});

// Receive new message
socket.on("chat message", (msg) => {
  const isOwn = currentUser && msg.username === currentUser.name;
  addMessage(msg.username, msg.content, msg.timestamp, msg.picture, isOwn);
});
