CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	author VARCHAR(45) NOT NULL,
	cover_url TEXT NOT NULL,
	rating_score INTEGER,
	review_text TEXT,
	review_date timestamptz,
	UNIQUE (title, author)
);

INSERT INTO books (title, author, rating_score, review_text, review_date, cover_url)
VALUES
  ('The Odyssey', 'Homer', 5, 'Excellent book!', '2024-01-31 12:34:56.789', 'https://covers.openlibrary.org/b/title/The Odyssey-L.jpg');