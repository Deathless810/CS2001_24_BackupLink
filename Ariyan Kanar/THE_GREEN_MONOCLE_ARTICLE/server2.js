const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'mask',
  password: 'C@ssandrasVault1697',
  database: 'article'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));


app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/article/:id', (req, res) => {
  const articleId = req.params.id;
  connection.query('SELECT * FROM articles WHERE id = ?', [articleId], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const article = results[0];
      res.render('article', { article });
    } else {
      res.send('Article not found');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
