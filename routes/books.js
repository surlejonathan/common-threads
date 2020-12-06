const express = require("express");
const router = express.Router();
const connection = require("../config");

// 1 - GET - Retrieve all of the data from book table

router.get("/", (req, res) => {
  connection.query("SELECT * FROM book", (err, results) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

// 2 - GET - Retrieve specific fields (here reference, title and return status)

router.get("/reference", (req, res) => {
  connection.query(
    "SELECT reference, title, returned FROM book",
    (err, results) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json(results);
      }
    }
  );
});

// 3 - GET - A filter for data that contains...

router.get("/title", (req, res) => {
  const sql = "SELECT * FROM book WHERE title LIKE ?";
  const sqlValue = [];
  req.query.contains && sqlValue.push(`%${req.query.contains}%`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res
        .status(404)
        .send(`No book containing '${req.query.contains}' in its title...`);
    }
  });
});

// 4 - GET - A filter for data that starts with...

router.get("/title/starting", (req, res) => {
  const sql = "SELECT * FROM book WHERE title LIKE ?";
  const sqlValue = [];
  req.query.with && sqlValue.push(`${req.query.with}%`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res
        .status(404)
        .send(`No book starting with '${req.query.with}' in its title...`);
    }
  });
});

// 5 - GET - A filter for data that is greater than...

router.get("/borrowing_date", (req, res) => {
  let sql = "SELECT * FROM book WHERE borrowing_date > ?";
  const sqlValue = [];
  req.query.greaterThan && sqlValue.push(`${req.query.greaterThan}`);

  connection.query(sql, sqlValue, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).send(`No book beyond '${req.query.greaterThan}'...`);
    }
  });
});

// 6 - GET - Ordered data recovery (i.e. ascending, descending)

router.get("/arrange", (req, res) => {
  let order = req.query.order;
  let sql = `SELECT * FROM book ORDER BY title ${order ? "DESC" : "ASC"}`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving data");
    } else if (results.length > 0) {
      res.status(200).json(results);
    }
  });
});

// GET - retrieve by search queries

router.get("/search", (req, res) => {
  const { title } = req.query;
  connection.query(
    "SELECT * FROM book WHERE title= ?",
    [title],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data");
      } else if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(404).send(`No book untitled ${title}`);
      }
    }
  );
});

// GET - retrieve by id
router.get("/book/:id", (req, res) => {
  const bookId = req.params.id;
  connection.query(
    "SELECT * FROM book WHERE id = ?",
    [bookId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving data...");
      } else if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(404).send("Book not found !");
      }
    }
  );
});

// 7 - POST - Insertion of a new entity

router.post("/", (req, res) => {
  const { title, borrowing_date, reference, returned } = req.body;
  connection.query(
    "INSERT INTO book (`title`, `borrowing_date`, `reference`, `returned`) VALUES(?, ?, ?, ?)",
    [title, borrowing_date, reference, returned],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error saving a book...");
      } else {
        res.status(200).send("Book successfully saved !");
      }
    }
  );
});

// 8 - PUT - Modification of an entity

router.put("/:id", (req, res) => {
  const bookId = req.params.id;
  const updatedBook = req.body;
  connection.query(
    "UPDATE book SET ? WHERE id = ?",
    [updatedBook, bookId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating data...");
      } else {
        res.status(200).send("Book successfully updated !");
      }
    }
  );
});

// 9 - PUT - Toggle a Boolean value

router.put("/toggle_returned/:id", (req, res) => {
  const bookId = req.params.id;
  connection.query(
    "UPDATE book SET returned = !returned WHERE id = ?",
    [bookId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating data...");
      } else {
        res
          .status(200)
          .send("Book's return status has been successfully updated !");
      }
    }
  );
});

// 10 - DELETE - Delete an entity

router.delete("/delete/:id", (req, res) => {
  const bookId = req.params.id;
  connection.query(
    "DELETE FROM book WHERE id = ?",
    [bookId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating data...");
      } else {
        res.status(200).send("Book successfully deleted !");
      }
    }
  );
});

// 11 - DELETE - Delete all entities where boolean value is false

router.delete("/delete/not_returned", (req, res) => {
  connection.query("DELETE FROM book WHERE returned = 0", (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating data...");
    } else {
      res.status(200).send("Books not-returned successfully deleted !");
    }
  });
});

module.exports = router;
