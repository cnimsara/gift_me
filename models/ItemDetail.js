
const express = require('express');
const pool = require('./database');
const router = express.Router();

router.get('/item/:id', (req, res) => {
  const itemId = req.params.id;

  const sql = `
    SELECT items.*, sellers.user_id AS sellerUserId
    FROM items
    JOIN sellers ON items.seller_id = sellers.seller_id
    WHERE items.item_id = ?
  `;

  pool.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      return res.status(404).send('Item not found');
    }

    const item = results[0];

    const currentUserId = req.session?.user?.id || null;
    const isSeller = item.sellerUserId === currentUserId;

    res.render('ItemDetail', {
      item,
      user: req.session.user || null,
      isSeller,
      isLoggedIn: !!req.session.user,
    });
  });
});


module.exports = router;
