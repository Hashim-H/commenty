const { body, validationResult, check, param } = require("express-validator");
const db = require("../services/db.js");
const checkComment = require("../services/checkComment.js");
const { v4: uuidv4 } = require("uuid");

//CREATE
exports.create = async (req, res) => {
  const commentId = uuidv4();
  await check("commentableKey").notEmpty().isAlphanumeric().run(req);
  await check("commentableId").notEmpty().isInt().run(req);
  await check("name").notEmpty().isAlphanumeric().isLength({ min: 3 }).run(req);
  await check("email")
    .notEmpty()
    .isEmail()
    .custom((email) => {
      return checkComment.checkUserAllowed(email, req.body.commentableKey);
    })
    .run(req);
  console.log("after valid");
  await check("body").notEmpty().run(req);
  await check("rating")
    .optional({
      nullable: true,
    })
    .isInt({ min: 1, max: 5 })
    .run(req);
  await check("parentCommentId")
    .optional({
      nullable: true,
      checkFalsy: false,
    })
    .isUUID()
    .bail()
    .custom(checkComment.checkCommentExists)
    .run(req);
  const answer = validationResult(req);
  if (!answer.isEmpty()) {
    return res.status(400).json({ errors: answer.mapped() });
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
        rating,
        parent_comment_id

  ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8)
  `,
      [
        commentId,
        req.body.commentableKey,
        req.body.commentableId,
        req.body.name,
        req.body.email,
        req.body.body,
        req.body.rating,
        req.body.parentCommentId,
      ]
    )
    .then((data) => {
      return res.status(200).json({ status: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: err });
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
};
exports.listKeyId = async (req, res) => {
  db.pool
    .query(
      `SELECT * FROM comments WHERE commentable_key = $1 AND commentable_id =$2
    `,
      [req.params.key, req.params.id]
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

// FILTER

exports.filter = async (req, res) => {
  let query = req.query;
  let key = req.params.key;
  let limit = "limit" in query ? query.limit : 20;
  let page = "page" in query ? query.page : 1;
  let offset = limit * (page - 1);

  let base = "FROM comments WHERE commentable_key =$1";
  let values = [key];

  let i = 2;

  if ("rating_from" in query) {
    base += " AND rating >= $" + i++;
    values.push(query.rating_from);
  }

  if ("rating_to" in query) {
    base += " AND rating <= $" + i++;
    values.push(query.rating_to);
  }

  if ("name" in query) {
    base += " AND name like $" + i++;
    values.push("%" + query.name + "%");
  }

  if ("email" in query) {
    base += " AND email like $" + i++;
    values.push("%" + query.email + "%");
  }

  let countSQL = "SELECT COUNT(comment_id) " + base + ";";

  db.pool
    .query(countSQL, values)
    .then((data) => {
      let total = data.rows[0].count;
      let last = Math.ceil(total / limit);
      let selectSQL =
        "SELECT * " + base + " OFFSET $" + i++ + " LIMIT $" + i++ + ";";

      values.push(offset, limit);

      return db.pool
        .query(selectSQL, values)
        .then((data) => {
          return res.status(200).json({ replies: data.rows, last_page: last });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({ errors: ["Invalid input"] });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ errors: ["Invalid input"] });
    });
};

//Stats

exports.getStats = async (req, res) => {
  db.pool
    .query(
      `SELECT COUNT(comment_id), 'comments' as type FROM comments WHERE parent_comment_id IS NULL
        UNION
        SELECT COUNT(comment_id), 'replies' as type FROM comments WHERE parent_comment_id IS NOT NULL
        UNION
        SELECT COUNT(DISTINCT commentable_key), 'partners' as type FROM comments;
    `
    )
    .then((data) => {
      let result = {};
      data.rows.forEach((element) => {
        result[element.type] = element.count;
      });
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ errors: [err] });
    });
};

// BLOCK
exports.block = async (req, res) => {
  await check("uuid") // in params
    .notEmpty()
    .isUUID()
    .custom(checkComment.checkCommentExists)
    .run(req);
  const answer = validationResult(req);
  if (!answer.isEmpty()) {
    return res.status(400).json({ errors: answer.mapped() });
  }
  let data = await db.pool.query(
    `SELECT commentable_key, email FROM comments WHERE comment_id = $1
    `,
    [req.params.uuid]
  );

  db.pool
    .query(
      `INSERT INTO blocked_users (
        commentable_key,
        email
  ) VALUES ( $1, $2 )
  `,
      [data.rows[0].commentable_key, data.rows[0].email]
    )
    .then((data) => {
      return res.status(200).json({ status: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: err });
    });
};

// latest comment

exports.latest = async (req, res) => {
  db.pool
    .query(
      `SELECT * FROM comments ORDER BY created_at DESC LIMIT 5;
    `
    )
    .then((data) => {
      return res.status(200).json({ comments: data.rows });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: [err] });
    });
};

exports.adminFilter = async (req, res) => {
  let query = req.query;
  let base = "";
  let values = [];
  let i = 1;

  if ("rating_from" in query) {
    base += " AND rating >= $" + i++;
    values.push(query.rating_from);
  }

  if ("rating_to" in query) {
    base += " AND rating <= $" + i++;
    values.push(query.rating_to);
  }
  if ("date_from" in query) {
    base += " AND created_at >= $" + i++;
    values.push(query.date_from);
  }

  if ("date_to" in query) {
    base += " AND created_at <= $" + i++;
    values.push(query.date_to);
  }
  if ("commentable_key" in query) {
    base += " AND commentable_key = $" + i++;
    values.push(query.commentable_key);
  }
  db.pool
    .query(
      `SELECT * FROM comments  WHERE 1=1 ${base} ;
    `,
      values
    )
    .then((data) => {
      return res.status(200).json({ comments: data.rows });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: [err] });
    });
};

//delete

exports.deleteComment = async (req, res) => {
  await param("uuid") // in params
    .notEmpty()
    .isUUID()
    .custom(checkComment.checkCommentExists)
    .run(req);
  const answer = validationResult(req);
  if (!answer.isEmpty()) {
    return res.status(400).json({ errors: answer.mapped() });
  }
  db.pool
    .query(
      `DELETE FROM comments WHERE comment_id = $1
  `,
      [req.params.uuid]
    )
    .then((data) => {
      return res.status(200).json({ status: true });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: err });
    });
};


//list commentable key

exports.getUniqueKeys = async (req, res) => {
  db.pool
    .query(
      `SELECT DISTINCT commentable_key FROM comments;
    `
    )
    .then((data) => {
      return res.status(200).json({ comments: data.rows });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ errors: [err] });
    });
};