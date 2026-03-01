const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = "messages.json";

// Load messages
function loadMessages() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// Save messages
function saveMessages(messages) {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
}

// Test route
app.get("/", (req, res) => {
  res.send("iPod Chat Server Running");
});

// Get messages
app.get("/messages", (req, res) => {
  res.json(loadMessages());
});

// Send message
app.post("/send", (req, res) => {
  const messages = loadMessages();
  const newMessage = {
    user: req.body.user,
    text: req.body.text,
    time: new Date().toISOString()
  };
  messages.push(newMessage);
  saveMessages(messages);
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});