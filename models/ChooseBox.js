const express = require('express');
const router = express.Router();
const pool = require('./database');

router.get('/ChooseBox', (req, res) => {
  const sellerId = req.query.seller_id;


  const sellerQuery = 'SELECT * FROM sellers WHERE seller_id = ?';
  const itemsQuery = 'SELECT * FROM items WHERE seller_id = ? AND category = "giftbox"';

  pool.query(sellerQuery, [sellerId], (err, sellerResults) => {
    if (err || sellerResults.length === 0) return res.send('Seller not found');

    pool.query(itemsQuery, [sellerId], (err, giftboxes) => {
      if (err) return res.send('Error loading items');

     res.render('ChooseBox', {
        seller: sellerResults[0],
        giftboxes,
        customBox: req.session.customBox,
        isLoggedIn: req.session.userId ? true : false,
        isSeller: req.session.userRole === 'seller'
      });
    });
  });
});

router.post('/selectBox', (req, res) => {
  const { id, price, photo, description } = req.body;
  const sellerId = req.body.sellerId; // get from hidden input

  if (!req.session.customBox) req.session.customBox = {};

  req.session.customBox.box = {
    id,
    price: parseFloat(price),
    photo,
    description
  };
  req.session.customBox.total = parseFloat(price);
  req.session.sellerId = sellerId; // save seller ID to session
  console.log('Selected Gift Box ID:', id);
  res.redirect(`/ChooseBox?seller_id=${sellerId}`);

});
// Remove selected box
router.post('/removeBox', (req, res) => {
  req.session.customBox.box = null;
  req.session.customBox.total = 0;
  res.redirect('back');
});


module.exports = router;
