const config = require('./utils/config.js');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const plansRouter = require('./controllers/plans.js');
const usersRouter = require('./controllers/users.js');
const positionsRouter = require('./controllers/positions.js');
const tasksRouter = require('./controllers/tasks.js');
const commentsRouter = require('./controllers/comments.js');
const loginRouter = require('./controllers/login.js');
const middleware = require('./utils/middleware.js');
const logger = require('./utils/logger.js');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');

const app = express();

logger.info('connecting to', config.MONGO_URL);

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(result => {
    logger.info('connected to Mongo');
  })
  .catch(error => {
    logger.info('error occured while connecting', error.message);
  });

morgan.token('body', (req, res) => JSON.stringify(req.body));
const logTemplate = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(express.static('build'));
app.get('/plans/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/plans', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(cors());
app.use(express.json());
app.use(morgan(logTemplate));

app.use('/api/login', loginRouter);

app.use(middleware.tokenExtractor);
app.use(middleware.tokenValidator);

app.use('/api/plans', plansRouter);
app.use('/api/users', usersRouter);
app.use('/api/positions', positionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comments', commentsRouter);


app.use(middleware.unknownRoute);
app.use(middleware.errorHandler);


module.exports = app;