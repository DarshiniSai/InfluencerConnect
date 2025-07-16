const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'influencer_db'
});

const db = pool.promise(); 

module.exports = db;
