const express = require('express');
const router = express.Router();
const api = require('./../controllers/index');

//Routes Here

//Create a Comment
router.post('/comment', api.create);

//Get Comments By Key
router.get('/comment/list/:key', api.listKey);

//Get Comments By Key & ID
router.get('/comment/list/:key/:id', api.listKeyId);

//Get Replies
router.get('/comment/:uuid/replies', api.listReplies);

//Filter By
router.get('/comment/:key/filter', api.filter);

//Show Stats
router.get('/stats', api.getStats);

// blocked
router.post('/comment/:uuid/block', api.block);

//latest
router.get('/comment/latest', api.latest);

//admin filter

router.get('/comment/adminFilter', api.adminFilter);

//delete
router.delete('/comment/:uuid/', api.deleteComment);

//list commentable keys
router.get('/getKeys', api.getUniqueKeys);

module.exports = router;
