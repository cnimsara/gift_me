const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('./database');

const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Both email and password are required');
  }

  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send('Error querying database');

    if (results.length === 0) return res.status(400).send('Email not registered');

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).send('Error comparing password');
      if (!isMatch) return res.status(400).send('Incorrect password');

      // ✅ Set base session values
      req.session.email = user.email;
      req.session.userId = user.id;

      // ✅ Initialize req.session.user object safely
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        country: user.country || ''
      };

      console.log('Logged in! Session email:', req.session.email);

      // ✅ Check if user is a seller
      const checkSellerSql = 'SELECT * FROM sellers WHERE user_id = ?';
      pool.query(checkSellerSql, [user.id], (err, sellerResults) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Server error');
        }
  const isSeller = sellerResults.length > 0;

  req.session.isSeller = isSeller;
  req.session.user.isSeller = isSeller;

  // ✅ Also store the seller_id if found
  if (isSeller) {
    req.session.user.seller_id = sellerResults[0].seller_id;
  }

        return res.redirect(isSeller ? '/index' : '/index');
      });
    });
  });
});

module.exports = router;
