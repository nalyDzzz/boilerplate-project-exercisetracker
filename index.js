const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

class Users {
  constructor(username) {
    this.username = username;
    this._id = new Date().getTime().toString(); // Unique ID for simplicity
    this.exercises = [];
  }

  addExercise(description, duration, date) {
    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString(),
    };
    this.exercises.push(exercise);
    return {
      username: this.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: this._id,
    };
  }
}

const userDb = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
  res.json(userDb);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = userDb.find((user) => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let logs = user.exercises;

  if (from) {
    const fromDate = new Date(from);
    logs = logs.filter((log) => new Date(log.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    logs = logs.filter((log) => new Date(log.date) <= toDate);
  }

  if (limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs,
  });
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const user = new Users(username);
  userDb.push(user);
  res.json({
    username: user.username,
    _id: user._id,
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  console.log("Received _id:", _id);
  console.log("Current userDb:", userDb);
  const exists = userDb.find((obj) => obj["_id"].toString() === _id);
  if (!exists) {
    res.json({ error: "Cannot locate that user." });
  } else {
    const newUser = exists.addExercise(description, duration, date);
    res.json(newUser);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
