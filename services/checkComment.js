const db = require("./db");

exports.checkCommentExists = (value) => {
  console.log("checking existance");
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
        console.log("gonna fail");
        throw new Error(`comment ${value} doesnt exists`);
      }
      return true;
    });
};

exports.checkUserAllowed = (email, commentable_key) => {
  console.log("checking blocked", commentable_key, email);
  return db.pool
    .query(
      `SELECT COUNT (*) 
                    FROM blocked_users
                    WHERE commentable_key =$1
                    AND email = $2;`,
      [commentable_key, email]
    )
    .then((result) => {
      console.log(result);
      if (result.rows[0].count === "0") {
        return true;
      }
      console.log("user not allowed");
      throw new Error(`User ${email} is blocked on this site!`);
    });
};
