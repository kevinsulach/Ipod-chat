const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
const DB_FILE = "messages.json";
const CHAT_PASSWORD = "KD123"; // CHANGE THIS!

// Storage Setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

function loadMessages() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveMessages(messages) {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
}

// Check Password Route
app.post("/login", (req, res) => {
  if (req.body.password === CHAT_PASSWORD) {
    res.json({ status: "ok" });
  } else {
    res.status(401).json({ status: "error", message: "Wrong Password" });
  }
});

app.get("/messages", (req, res) => {
  // Simple protection: Check if password was sent in headers
  if (req.headers['x-password'] !== CHAT_PASSWORD) return res.status(401).send("Unauthorized");
  res.json(loadMessages());
});

app.post("/send", (req, res) => {
  if (req.body.password !== CHAT_PASSWORD) return res.status(401).send("Unauthorized");
  const messages = loadMessages();
  messages.push({
    user: req.body.user,
    text: req.body.text,
    type: 'text',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  saveMessages(messages);
  res.json({ status: "ok" });
});

app.post("/upload", upload.single('photo'), (req, res) => {
  if (req.body.password !== CHAT_PASSWORD) return res.status(401).send("Unauthorized");
  const messages = loadMessages();
  messages.push({
    user: req.body.user,
    url: '/uploads/' + req.file.filename,
    type: 'image',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  saveMessages(messages);
  res.json({ status: "ok" });
});

app.listen(PORT, () => console.log(`Secure Server running on port ${PORT}`));