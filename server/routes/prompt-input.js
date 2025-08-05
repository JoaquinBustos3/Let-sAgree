const express = require('express');
const router = express.Router();
const promptInputController = require('../controllers/prompt-input-controller');

router.post('/', promptInputController.receivePromptInput);

module.exports = router;
