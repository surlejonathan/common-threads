const express = require("express");
const router = express.Router();

const books = require("./books");

router.use("/books", books);

module.exports = router;
