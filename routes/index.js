const express = require("express");
const router = express.Router();
const controllers = require("./../controllers/index");

//Routes Here


router.post('/comment', controllers.create);

module.exports = router;
