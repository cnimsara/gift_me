// db.js
const mysql = require('mysql2');

// Create a connection pool (better for production & multiple queries)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'gift_me',
  waitForConnections: true,
  connectionLimit: 10, // Max concurrent connections
  queueLimit: 0
});

// Test pool connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL pool:', err);
  } else {
    console.log('✅ Connected to MySQL pool with thread ID:', connection.threadId);
    connection.release(); // Always release after using
  }
});

module.exports = pool;
