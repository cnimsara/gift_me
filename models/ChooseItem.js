const express = require('express');
const router = express.Router();
const pool = require('./database');

// Display items for selection
router.get('/ChooseItem/:seller_id', (req, res) => {
  const sellerId = req.params.seller_id;
  
  if (!sellerId) return res.send('Seller not selected');

  const sellerQuery = 'SELECT * FROM sellers WHERE seller_id = ?';
  const itemQuery = `
    SELECT item_id, price, description, photo1 
    FROM items 
    WHERE seller_id = ? AND category NOT IN ('giftbox', 'wrappingPaper')
  `;

  pool.query(sellerQuery, [sellerId], (err, sellerResults) => {
    if (err || sellerResults.length === 0) return res.send('Seller not found');

    pool.query(itemQuery, [sellerId], (err, items) => {
      if (err) return res.send('Error loading gift items');

      res.render('ChooseItem', {
        seller: sellerResults[0],
        items,
        customBox: req.session.customBox || {},
        isLoggedIn: !!req.session.userId,
        isSeller: req.session.userRole === 'seller'
      });
    });
  });
});

// Handle item selection
router.post('/selectItem', (req, res) => {
  const { id, name, price, photo, sellerId } = req.body;

  if (!req.session.customBox) req.session.customBox = {};
  if (!req.session.customBox.items) req.session.customBox.items = [];

  req.session.customBox.items.push({
    id,
    name,
    price: parseFloat(price),
    photo
  });

  // Recalculate total
  const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price) : 0;
  const wrapPrice = req.session.customBox.wrap ? parseFloat(req.session.customBox.wrap?.price || 0) : 0;
  const itemsTotal = req.session.customBox.items.reduce((sum, item) => sum + item.price, 0);

  req.session.customBox.total = boxPrice + wrapPrice + itemsTotal;
  req.session.sellerId = sellerId;
console.log('Selected items ID:', id);
  res.redirect(`/ChooseItem/${sellerId}`);
});

// Remove selected item
router.post('/removeItem', (req, res) => {
  const { itemId } = req.body;
  console.log('Remove request for itemId:', itemId);

   if (req.session.customBox && Array.isArray(req.session.customBox.items)) {
    console.log('Before removal:', req.session.customBox.items);

    // Find the first item with a matching ID
    const index = req.session.customBox.items.findIndex(
      item => String(item.id) === String(itemId)
    );

    if (index !== -1) {
      req.session.customBox.items.splice(index, 1); // ✅ Remove only one item
    }

    console.log('After removal:', req.session.customBox.items);

    // Recalculate total
    const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price) : 0;
    const wrapPrice = req.session.customBox.wrap ? parseFloat(req.session.customBox.wrap?.price || 0) : 0;
    const itemsTotal = req.session.customBox.items.reduce((sum, item) => sum + item.price, 0);

    req.session.customBox.total = boxPrice + wrapPrice + itemsTotal;
  }

res.redirect(req.get('Referrer') || '/');
});

module.exports = router;
