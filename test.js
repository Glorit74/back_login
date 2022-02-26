const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3200;

app.use(cors());
app.use(express.json());

const players = require('./players.json');
//
app.get('/', (req, res) => {
  res.send('Welcome on my quiz APP');
});

app.post('/quiz/api/login', (req, res) => {
  if (!req.body.username || !req.body.password) res.sendStatus(400);

  for (const player of players) {
    if (player.username === req.body.username) res.sendStatus(409);
  }

  const newPlayer = {
    username: req.body.username,
    password: req.body.password,
    answers: [],
  };

  players.push(newPlayer);
  fs.writeFileSync('./players.json', JSON.stringify(players, null, 4));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
