const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const dev = require('./config');
const connectDb = require('./config/connectDb');
const usersRouter = require('./routers/users');
const adminRouter = require('./routers/admin');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.get('/', (req, res) => {
  res.status(200).send("You are at root")
})

app.listen(dev.serverPort, () => {
  console.log(`Server is alive at http://localhost:${dev.serverPort}`);
  connectDb();
})