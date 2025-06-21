const express = require('express');
const router = express.Router();
const pool = require('./database'); 

// Become a Seller route
router.post('/becomeSeller', (req, res) => {
  const userId = req.session.userId; // Ensure session is set

  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  const {
    shopName,
    category,
    description,
    paymentMethod,
    cardNumber,
    expiry,
    cvv
  } = req.body;

  // Check if already a seller
  pool.query('SELECT * FROM sellers WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Error checking seller status');
    }

    if (results.length > 0) {
        req.session.message = 'You are already a seller';
        return res.redirect('/SellerDash');
    }

    // Insert seller details
    const query = `
      INSERT INTO sellers (user_id, shop_name, category, description, payment_method, card_number, expiry_date, cvv)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      shopName,
      category,
      description,
      paymentMethod,
      paymentMethod === 'card' ? cardNumber : null,
      paymentMethod === 'card' ? expiry : null,
      paymentMethod === 'card' ? cvv : null
    ];

    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting seller details into database:', err);
        return res.status(500).send('Error inserting seller details into database');
      }

      // Redirect to seller dashboard or show success
      res.redirect('/SellerDash');
    });
  });
});

module.exports = router;
