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


/*
app.use((err, req, res, next) => {
  console.error('An error occurred:', err.message);
  console.error(err.stack); // Log the stack trace for debugging

  const statusCode = err.statusCode || 500; // Use custom status code or default to 500
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    error: {
      message: message,
      // In a production environment, avoid sending the full stack trace to the client
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});
*/

app.listen(PORT, () => {
    //console.log(`Server is listening on http://localhost:${PORT}`);
    logger.info(`Server started on http://localhost:${PORT}`);
})