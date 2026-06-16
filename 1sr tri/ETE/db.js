const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'etedb',
  multipleStatements: true 
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();

  connection.query(sql, (err, results) => {
    if (err) throw err;
    console.log('SQL file executed successfully');
  });
});

module.exports = connection;
