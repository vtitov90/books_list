import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books_storage",
  password: "fm1234",
  port: 5432,
});

db.connect();

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// Geting all boks from db

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("index.ejs", { books: result.rows });
  } catch (error) {
    console.error("Error occured while recieving books from database", error);
  }
});

// Sorting all boks from db

app.post("/sort", async (req, res) => {
  const result = await db.query(
    `SELECT * FROM books ORDER BY ${req.body.criteria} ASC`
  );
  res.render("index.ejs", { books: result.rows });
});

// Book from search list

app.get("/book", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM books WHERE title=$1 AND author=$2",
      [req.query.title, req.query.author]
    );

    let renderFile;
    let renderObj;
    if (result.rows.length) {
      renderFile = "update_book.ejs";
      renderObj = {
        title: req.query.title,
        author: req.query.author,
        cover_url: `https://covers.openlibrary.org/b/title/${req.query.title}-L.jpg`,
        id: result.rows[0].id,
        review_text: result.rows[0].review_text,
        rating: result.rows[0].rating_score,
        review_date: result.rows[0].review_date,
      };
    } else {
      renderFile = "book.ejs";
      renderObj = {
        title: req.query.title,
        author: req.query.author,
        cover_url: `https://covers.openlibrary.org/b/title/${req.query.title}-L.jpg`,
      };
    }

    res.render(renderFile, renderObj);
  } catch (error) {
    console.error(error);
  }
});

// Adding book to db

app.post("/add", async (req, res) => {
  try {
    const reviewDate = req.body.review.length ? new Date() : null;
    await db.query(
      `INSERT INTO books (title, author, rating_score, review_text, review_date, cover_url) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.body.title,
        req.body.author,
        req.body.rating,
        req.body.review,
        reviewDate,
        `https://covers.openlibrary.org/b/title/${req.body.title}-L.jpg`,
      ]
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

// Editing book from db

app.post("/edit/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id=$1", [
      req.params.id,
    ]);
    res.render("update_book.ejs", {
      id: req.params.id,
      title: result.rows[0].title,
      author: result.rows[0].author,
      cover_url: result.rows[0].cover_url,
      review_text: result.rows[0].review_text,
      rating: result.rows[0].rating_score,
      review_date: result.rows[0].review_date,
    });
  } catch (error) {
    console.error(error);
  }
});

// Updating book from db (submit edit)

app.post("/update/:id", async (req, res) => {
  try {
    if (req.body.rating) {
      await db.query(
        "UPDATE books SET rating_score=$1, review_text=$2 WHERE id=$3",
        [+req.body.rating, req.body.review, +req.params.id]
      );
    } else {
      await db.query("UPDATE books SET review_text=$1 WHERE id=$2", [
        req.body.review,
        +req.params.id,
      ]);
    }

    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

// Deleting book from db

app.post("/delete/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
