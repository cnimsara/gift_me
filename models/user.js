const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is used for password hashing
const pool = require('./database'); // Import your MySQL database pool

const router = express.Router();

// Sign-up route
router.post('/', (req, res) => {
  const {firstName, username, lastName, email, password, bio, country } = req.body;

  // Check if all fields are provided
  if (!username || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  // Check if the email already exists in the database
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).send('Error checking email');
    }

    if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });  // Send back a JSON response with the message
    }

    // Check if the username already exists in the database
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        return res.status(500).send('Error checking username');
      }

      if (results.length > 0) {
        return res.status(400).send('Username already exists');
      }

      // Hash the password before saving to the database
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).send('Error hashing password');
        }

       // Insert into the database
       const query = `INSERT INTO users (first_name, last_name, username, email, password, bio, country) VALUES (?, ?, ?, ?, ?, ?, ?)`;

     pool.query(query, [
      firstName || null, 
      lastName || null,
      username,
      email,
      hashedPassword,
      bio || null,
      country || null
     ], (err, results) => {
       if (err) {
         return res.status(500).send('Error inserting user into database');
       }


       

          // Return a success message
          res.redirect('/signin');
        });
      });
    });
  });
});

module.exports = router;
