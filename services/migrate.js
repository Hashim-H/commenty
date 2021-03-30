const db = require("./db");

const createTables = () => {
  const commentsTable = `CREATE TABLE IF NOT EXISTS
      comments(
        comment_id uuid,
        commentable_key VARCHAR NOT NULL,
        commentable_id INT NOT NULL,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        body text NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <=5),
        parent_comment_id uuid,
        created_at TIMESTAMP DEFAULT now(),
        deleted_at TIMESTAMP,
        PRIMARY KEY (comment_id),
        CONSTRAINT fk_parent_comment_id
        FOREIGN KEY(parent_comment_id) 
        REFERENCES comments(comment_id)
        ON DELETE CASCADE
      )`;
  db.pool
    .query(commentsTable)
    .then((res) => {
      console.log('1',res);
      db.pool.end();
    })
    .catch((err) => {
      console.log('2',err);
      db.pool.end();
    });
};

module.exports = {
  createTables,
};

require("make-runnable");
