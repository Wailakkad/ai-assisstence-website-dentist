const express = require('express');
const router = express.Router();
const ChatControler = require('../controllers/ChatController');

router.post('/', ChatControler)


module.exports = router;