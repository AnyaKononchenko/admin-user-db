const express = require('express');
const dev = require('./config');
const connectDb = require('./config/connectDb');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send("You are at root")
})

app.listen(dev.serverPort, () => {
  console.log(`Server is alive at http://localhost:${dev.serverPort}`);
  connectDb();
})