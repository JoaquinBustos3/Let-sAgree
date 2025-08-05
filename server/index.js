var express = require('express');
var app = express();
app.use(express.json()); 

const categoriesRouter = require('./routes/categories');
app.use('/categories', categoriesRouter);

const promptInputRouter = require('./routes/prompt-input');
app.use('/prompt-input', promptInputRouter);

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});