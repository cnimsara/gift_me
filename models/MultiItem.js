const express = require('express');
const router = express.Router();
const pool = require('./database');


router.use((req, res, next) => {
  if (!req.session.customBox) req.session.customBox = {};
  if (!req.session.customBox.items) req.session.customBox.items = [];
  if (!req.session.customBox.boxes) req.session.customBox.boxes = [];
  if (!req.session.customWrap) req.session.customWrap = {};
  if (!req.session.customWrap.wraps) req.session.customWrap.wraps = [];
  next();
});
// Show all items from all sellers (excluding giftbox and wrappingPaper)
router.get('/multiItem', (req, res) => {
  let sellerIds = req.query.sellerIds; // e.g. "1,2,3"

  const sellersQuery = 'SELECT seller_id, shop_name FROM sellers';

  let itemsQuery = `
    SELECT items.item_id, items.brand AS name, items.price, items.description, items.photo1, sellers.seller_id, sellers.shop_name
  FROM items
  JOIN sellers ON items.seller_id = sellers.seller_id
  WHERE items.category NOT IN ('giftbox', 'wrappingPaper')
  `;

  const queryParams = [];

  if (sellerIds) {
    sellerIds = sellerIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (sellerIds.length > 0) {
      // Add filtering by sellerIds
      itemsQuery += ` AND sellers.seller_id IN (${sellerIds.map(() => '?').join(',')})`;
      queryParams.push(...sellerIds);
    }
  }

  req.session.selectedSellers = sellerIds;

  pool.query(sellersQuery, (err, sellers) => {
    if (err) return res.send('Error loading sellers');

    pool.query(itemsQuery, queryParams, (err, items) => {
      if (err) return res.send('Error loading items');

      res.render('multiItem', {
        sellers,
        items,
        customBox: req.session.customBox || {},
        customWrap: req.session.customWrap || {},
        customItems: (req.session.customBox && req.session.customBox.items) || [], // ✅ FIX
        isLoggedIn: !!req.session.userId,
        isSeller: req.session.userRole === 'seller'
      });
    });
  });
});

// Add an item to the custom box session
router.post('/multiItem/select', (req, res) => {
  const { id, name, price, photo, sellerId, category } = req.body;

  console.log('Received selection: ', { id, name, price, photo, sellerId, category });

  if (!req.session.customBox) req.session.customBox = {};
  if (!req.session.customBox.items) req.session.customBox.items = [];
  if (!req.session.customBox.boxes) req.session.customBox.boxes = [];
  if (!req.session.customWrap) req.session.customWrap = {};
  if (!req.session.customWrap.wraps) req.session.customWrap.wraps = [];

  if (category === 'giftbox') {
    console.log(`Assigning giftbox with ID: ${id}`);
    req.session.customBox.box = {
      id,
      name,
      price: parseFloat(price),
      photo,
      sellerId
    };
  } else if (category === 'wrappingPaper') {
    console.log(`Adding wrapping paper with ID: ${id}`);

    // Assuming you want to push wraps into the wraps array:
    req.session.customWrap.wraps.push({
      id,
      name,
      price: parseFloat(price),
      photo,
      sellerId
    });
  } else {
    console.log(`Adding regular item with ID: ${id}`);
    req.session.customBox.items.push({
      id,
      name,
      price: parseFloat(price),
      photo,
      sellerId
    });
  }

  // Recalculate totals
  const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price || 0) : 0;
  const wrapPrice = req.session.customWrap && Array.isArray(req.session.customWrap.wraps)
    ? req.session.customWrap.wraps.reduce((sum, wrap) => sum + (wrap.price || 0), 0)
    : 0;
  const itemsTotal = Array.isArray(req.session.customBox.items)
    ? req.session.customBox.items.reduce((sum, item) => sum + (item.price || 0), 0)
    : 0;

  req.session.customBox.total = boxPrice + wrapPrice + itemsTotal;

  console.log('Session after adding:', {
    box: req.session.customBox.box,
    wraps: req.session.customWrap.wraps,
    items: req.session.customBox.items,
    total: req.session.customBox.total
  });

  res.redirect('/multiItem');
});

// Remove an item from the custom box session
router.post('/multiItem/remove', (req, res) => {
const { itemId } = req.body;

  if (req.session.customBox && Array.isArray(req.session.customBox.items)) {
    const index = req.session.customBox.items.findIndex(item => String(item.id) === String(itemId));
    
    if (index !== -1) {
      req.session.customBox.items.splice(index, 1);
    }

    // Recalculate total
    const boxPrice = req.session.customBox.box ? parseFloat(req.session.customBox.box.price) : 0;
    const wrapPrice = req.session.customBox.wrap ? parseFloat(req.session.customBox.wrap.price || 0) : 0;
    const itemsTotal = req.session.customBox.items.reduce((sum, item) => sum + item.price, 0);

    req.session.customBox.total = boxPrice + wrapPrice + itemsTotal;
  }

  res.redirect(req.get('Referrer') || '/multiItem');
});

module.exports = router;
