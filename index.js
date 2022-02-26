const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const users = require('./users.json');

const sessions = {};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/signup', (req, res) => {
  if (!req.body.username || !req.body.password) return res.sendStatus(400);

  for (const user of users) {
    if (user.username === req.body.username) return res.sendStatus(409);
  }

  const newUser = {
    username: req.body.username,
    password: req.body.password,
    todoList: [],
  };

  users.push(newUser);
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 4));
  res.sendStatus(200);
});

app.post('/api/login', (req, res) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.sendStatus(401);

  const credential = authHeader.split('&&&');
  const username = credential[0];
  const password = credential[1];

  const user = users.find(
    (user) => username === user.username && password === user.password
  );
  if (!user) return res.sendStatus(401);
  let sessionId = Math.random().toString();
  sessions[sessionId] = user; //összepárosítjuk a user-t ezzel az azonosítóval, ami key lesz, hozzá object formátumban kapcsolódik a user adat (username, password, todo)
  console.log(sessions);

  setTimeout(() => {
    delete sessions[sessionId];
    console.log('session end');
  }, 30 * 1000); // after this period the sessionId is expired
  res.json(sessionId);
});

app.get('/api/todo', (req, res) => {
  //   const authHeader = req.header('Authorization');
  //   if (!authHeader) return res.sendStatus(401);
  // const credential = authHeader.split('&&&');
  // const username = credential[0];
  // const password = credential[1];
  // ** username and password were sended in header

  const sessionId = req.header('Authorization');
  if (!sessionId) return res.sendStatus(401);

  const sessionUser = sessions[sessionId];
  //logged in user
  if (!sessionUser) return res.sendStatus(401);

  const username = sessionUser.username;
  const password = sessionUser.password;

  const user = users.find(
    (user) => username === user.username && password === user.password
  );
  if (!user) return res.sendStatus(401);

  return res.json(user.todoList);
});

app.post('api/todo', (req, res) => {
  //   const authHeader = req.header('Authorization');
  //   if (!authHeader) return res.sendStatus(401);

  //   const credential = authHeader.split('&&&');
  //   const username = credential[0];
  //   const password = credential[1];

  const sessionId = req.header('Authorization');
  if (!sessionId) return res.sendStatus(401);

  const sessionUser = sessions[sessionId];

  if (!sessionUser) return res.sendStatus(401);

  const username = sessionUser.username;
  const password = sessionUser.password;

  const user = users.find(
    (user) => username === user.username && password === user.password
  );
  if (!user) return res.sendStatus(401);

  if (!req.body.msg) return res.sendStatus(400);

  user.todoList.push(req.body.msg);
  fs.writeFileSync('./users.json', JSON.stringify(users, null, 4));
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
