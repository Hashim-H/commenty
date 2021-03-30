const express = require("express");
const router = express.Router();
const controllers = require("./../controllers/index");

//Routes Here

//Create a Comment
router.post("/comment", controllers.create);

//Get Comments By Key
router.get("/comment/list/:key", controllers.listKey);

//Get Comments By Key & ID
router.get("/comment/list/:key/:id", controllers.listKeyId);

//Get Replies
router.get("/comment/:uuid/replies", controllers.listReplies);

//Filter By
router.get("/comment/:key/filter", controllers.filter);

module.exports = router;
