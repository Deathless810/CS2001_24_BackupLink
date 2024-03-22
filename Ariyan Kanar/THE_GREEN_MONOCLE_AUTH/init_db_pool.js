const mysql = require('mysql');
const mysql2 = require('mysql2/promise');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const con = mysql.createConnection({
      host: "localhost",
      user: "mask",
      password: "C@ssandrasVault1697",
    });

    con.connect((err) => {
      if (err) reject(err);
      console.log("Connected!");

      con.query("SHOW DATABASES LIKE 'mydb';", (err, result) => {
        if (err) {
          con.end();
          reject(err);
        }

        if (result.length === 0) {
          con.query("CREATE DATABASE mydb", (err, result) => {
            con.end();
            if (err) reject(err);
            console.log("Database created");
            resolve(createPool());
          });
        } else {
          console.log("Database already exists");
          con.end();
          resolve(createPool());
        }
      });
    });
  });
}

function createPool() {
  return mysql2.createPool({
    host: 'localhost',
    user: 'mask',
    password: 'C@ssandrasVault1697',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = initializeDatabase;
