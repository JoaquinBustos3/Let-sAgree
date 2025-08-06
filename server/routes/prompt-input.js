const express = require("express");
const router = express.Router();
const promptInputController = require("../controllers/prompt-input-controller");

// Accept category as a path variable
router.post("/:category", promptInputController.receivePromptInput);

module.exports = router;
