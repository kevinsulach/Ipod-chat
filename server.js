const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// This line tells the server to show your index.html automatically
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const DB_FILE = "messages.json";

function loadMessages() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveMessages(messages) {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
}

app.get("/messages", (req, res) => {
  res.json(loadMessages());
});

app.post("/send", (req, res) => {
  const messages = loadMessages();
  const newMessage = {
    user: req.body.user,
    text: req.body.text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  messages.push(newMessage);
  saveMessages(messages);
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});