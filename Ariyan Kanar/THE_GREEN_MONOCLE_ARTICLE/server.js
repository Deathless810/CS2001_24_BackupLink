const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;


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
    connection.query('SELECT * FROM articles ORDER BY date DESC LIMIT 3', (err, results) => {
      if (err) {
        console.error('Failed to fetch articles:', err);

        res.status(500).send('Error fetching articles');
        return;
      }
      res.render('index', { articles: results });
    });
});


app.get('/article/:id', (req, res) => {
  const articleId = req.params.id;
  connection.query('SELECT * FROM articles WHERE id = ?', [articleId], (err, results) => {
    if (err) {
      console.error('Failed to fetch article:', err);
      res.status(500).send('Error fetching article');
      return;
    }
    if (results.length > 0) {
      const article = results[0];
      res.render('article', { article });
    } else {
      res.send('Article not found');
    }
  });
});

app.get('/categories', (req, res) => {
    connection.query('SELECT * FROM articles ORDER BY category, date DESC', (err, results) => {
        if (err) {
            console.error('Failed to fetch articles:', err);
            res.status(500).send('Error fetching articles');
            return;
        }
        // Group articles by category
        const articlesByCategory = results.reduce((acc, article) => {
            (acc[article.category] = acc[article.category] || []).push(article);
            return acc;
        }, {});

        res.render('categories', { articlesByCategory });
    });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
