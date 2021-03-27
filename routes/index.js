const express = require("express");
const router = express.Router();
const controllers = require("./../controllers/index");

//Routes Here


router.post('/comment', controllers.create);
router.get("/comment/list/:key", controllers.listKey);
router.get("/comment/list/:key/:id", controllers.listKeyId);
router.get("/comment/:uuid/replies", controllers.listReplies);



module.exports = router;
