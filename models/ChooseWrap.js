const express = require('express');
const router = express.Router();
const pool = require('./database');

// Display wrapping options
router.get('/ChooseWrap/:seller_id', (req, res) => {
  const sellerId = req.params.seller_id;

  if (!sellerId) return res.send('Seller not selected');

  const sellerQuery = 'SELECT * FROM sellers WHERE seller_id = ?';
  const wrapQuery = 'SELECT * FROM items WHERE seller_id = ? AND category = "wrappingPaper"';

  pool.query(sellerQuery, [sellerId], (err, sellerResults) => {
    if (err || sellerResults.length === 0) return res.send('Seller not found');

    pool.query(wrapQuery, [sellerId], (err, wraps) => {
      if (err) return res.send('Error loading wrapping items');

      res.render('ChooseWrap', {
        seller: sellerResults[0],
        wraps,
        customBox: req.session.customBox || {},
        isLoggedIn: req.session.userId ? true : false,
        isSeller: req.session.userRole === 'seller'
      });
    });
  });
});

// Handle wrap selection
router.post('/selectWrap', (req, res) => {
  const { id, price, photo, description,sellerId  } = req.body;

  if (!req.session.customBox) req.session.customBox = {};

  req.session.customBox.wrap = {
    id,
    price: parseFloat(price),
    photo,
    description
  };
 req.session.customBox.total = parseFloat(price);
  req.session.sellerId = sellerId; 
  // Update total
  const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price) : 0;
  req.session.customBox.total = boxPrice + parseFloat(price);
console.log('Selected Wrapping Paper ID:', id);
res.redirect(`/ChooseWrap/${sellerId}`);
});

// Remove selected wrap
router.post('/removeWrap', (req, res) => {
  if (req.session.customBox) {
    req.session.customBox.wrap = null;
    const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price) : 0;
    req.session.customBox.total = boxPrice;
  }
  res.redirect('back');
});

module.exports = router;
