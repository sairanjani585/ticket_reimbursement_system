const express = require('express');
const app = express();
const {logger, loggerMiddleware} = require('./util/logger');
const userController = require('./controller/userController');
const ticketController = require('./controller/ticketController');
const PORT = 3000;

app.use(express.json());
app.use(loggerMiddleware);

app.use("/users",userController);
app.use("/tickets", ticketController);

app.get("/", (req, res) => {
    res.send("Home Page");
})

app.use((err, req, res, next) => {
  logger.error('An error occurred:', err.message);
  logger.error(err.stack);
  const statusCode = err.statusCode || 500; 
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({error: message});
});

app.listen(PORT, () => {
    logger.info(`Server is listening on http://localhost:${PORT}`);
})