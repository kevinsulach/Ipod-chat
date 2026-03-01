const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// This allows the browser to see the "uploads" folder
app.use('/uploads', express.static('uploads')); 

const PORT = process.env.PORT || 3000;
const DB_FILE = "messages.json";

// Configure where to save photos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

function loadMessages() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveMessages(messages) {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
}

app.get("/messages", (req, res) => res.json(loadMessages()));

// Handle text messages
app.post("/send", (req, res) => {
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

// Handle photo uploads
app.post("/upload", upload.single('photo'), (req, res) => {
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));