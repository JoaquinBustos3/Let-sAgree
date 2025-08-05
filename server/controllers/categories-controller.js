const fs = require('fs');
const path = require('path');

const categoriesFile = path.join(__dirname, '../data/categories.json');

function readCategories() {
  const data = fs.readFileSync(categoriesFile, 'utf8');
  return JSON.parse(data);
}

exports.getCategories = (req, res) => {
  const categories = readCategories();
  res.json(categories);
};