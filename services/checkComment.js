const db = require("./db");

exports.checkCommentExists = (value) => {
  // console.log("working");
  return db.pool
    .query(
      `SELECT COUNT (comment_id) 
                    FROM comments
                    WHERE comment_id =$1;`,
      [value]
    )
    .then((result) => {
      console.log(result);
      if (result.rows[0].count === "0") {
        throw new Error("parent comment doesnt exists");
      }
      return true;
    });
};
