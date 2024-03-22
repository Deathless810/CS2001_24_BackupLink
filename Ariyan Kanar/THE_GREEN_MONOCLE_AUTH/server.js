const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const initializeDatabase = require('./init_db_pool.js');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

app.use(cors());
app.use(express.static('public')); // Serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'rqAwjjciP0nXa7j0jwC3bV7/rLd/dCML',
    resave: true,
    saveUninitialized: true
}));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

// Serve the signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.set('view engine', 'ejs');

// Handle the signup form submission
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password, passwordRetype } = req.body;

        // Validate password match
        if (password !== passwordRetype) {
            return res.status(400).send('Passwords do not match.');
        }

        const pool = await initializeDatabase();
        
        async function insertUser(username, email, plaintextPassword, role = 'USER') {
            bcrypt.hash(plaintextPassword, saltRounds, async function(err, hash) {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).send('Error creating user.');
                }

                const sql = "INSERT INTO ACCOUNT (username, email, password, role) VALUES (?, ?, ?, ?);";
                try {
                    const [result] = await pool.query(sql, [username, email, hash, role]);
                    console.log("User inserted:", result);
                    res.send('Signup successful!');
                } catch (error) {
                    console.error("Error inserting user:", error);
                    res.status(500).send('Error creating user.');
                }
            });
        }

        await insertUser(username, email, password);
    } catch (err) {
        console.error("Initialization or signup failed:", err);
        res.status(500).send('Internal server error.');
    }
});

app.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
      try {
          const pool = await initializeDatabase();
          const sql = 'SELECT * FROM account WHERE username = ?';
          const [results] = await pool.query(sql, [username]);

          if (results.length > 0) {
              // Assuming passwords are hashed in your database
              const comparisonResult = await bcrypt.compare(password, results[0].password);
              if (comparisonResult) {
                  req.session.loggedin = true;
                  req.session.username = username;
                  res.redirect('/home');
              } else {
                  res.send('Incorrect Username and/or Password!');
              }
          } else {
              res.send('Incorrect Username and/or Password!');
          }
      } catch (error) {
          console.error('Auth error:', error);
          res.status(500).send('Internal server error');
      }
  } else {
      res.send('Please enter Username and Password!');
  }
});

// Redirect to home after login
// app.get('/home', (req, res) => {
//   if (req.session.loggedin) {
//       res.send(`Welcome back, ${req.session.username}!`);
//   } else {
//       res.send('Please login to view this page!');
//   }
// });


app.get('/home', (req, res) => {
  if (req.session.loggedin) {
    // If logged in, redirect to the index page
    res.sendFile(path.join(__dirname, 'public', 'views','index.html')); // Adjust the path as necessary
  //  res.send(`Welcome back, ${req.session.username}!`);
} else {
    // If not logged in, redirect to the login page
    res.redirect('/login'); // Redirect to the login page
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));