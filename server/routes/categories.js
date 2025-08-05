const express = require('express');
const router = express.Router();
const categoriesMiddleware = require('../middleware/categories-middleware');
const categoriesController = require('../controllers/categories-controller');

// GET /categories
router.get('/', categoriesMiddleware, categoriesController.getCategories);

module.exports = router;
