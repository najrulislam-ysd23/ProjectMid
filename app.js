const port = 8000;
const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();
const databaseConnection = require("./config/database");

databaseConnection(() => {
  app.listen(8000, () => {
    // console.log(process.env.TEST_DB);
    console.log("Server is running on port", port);
  });
});
