const { body, validationResult, check } = require("express-validator");
const db = require("../services/db.js");
const { v4: uuidv4 } = require("uuid");

const checkCommentExists = function (value) {
  console.log("working");
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

//CREATE
exports.create = async (req, res) => {
  const commentId = uuidv4();
  await check("commentableKey").notEmpty().isAlphanumeric().run(req);
  await check("commentableId").notEmpty().isInt().run(req);
  await check("name").notEmpty().isAlphanumeric().isLength({ min: 3 }).run(req);
  await check("email").notEmpty().isEmail().run(req);
  await check("body").notEmpty().run(req);
  await check("parentCommentId")
    .optional({
      nullable: true,
      checkFalsy: true,
    })
    .isUUID()
    .bail()
    .custom(checkCommentExists)
    .run(req);
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.mapped() });
  }
  db.pool
    .query(
      `INSERT INTO comments (
        comment_id,
        commentable_key,
        commentable_id,
        name,
        email,
        body,
        parent_comment_id
  ) VALUES ( $1, $2, $3, $4, $5, $6, $7)
  `,
      [
        commentId,
        req.body.commentableKey,
        req.body.commentableId,
        req.body.name,
        req.body.email,
        req.body.body,
        req.body.parentCommentId,
      ]
    )
    .then((data) => {
      return res.status(200).json({ status: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ errors: ["Invalid input"] });
    });
};

//LIST

exports.listKey = async (req, res) => {
    db.pool
      .query(
        `SELECT * FROM comments WHERE commentable_key = $1
    `,
        [req.params.key]
      )
      .then((data) => {
        return res.status(200).json({ comments: data.rows });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({ errors: ["Invalid input"] });
      });
}
exports.listKeyId = async (req, res) => {
  db.pool
    .query(
      `SELECT * FROM comments WHERE commentable_key = $1 AND commentable_id =$2
    `,
    [
        req.params.key,
        req.params.id
    ]
    )
    .then((data) => {
      return res.status(200).json({ comments: data.rows });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ errors: ["Invalid input"] });
    });
};
exports.listReplies = async (req, res) => {
  db.pool
    .query(
      `SELECT * FROM comments WHERE parent_comment_id = $1
    `,
      [req.params.uuid]
    )
    .then((data) => {
      return res.status(200).json({ replies: data.rows });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ errors: ["Invalid input"] });
    });
};