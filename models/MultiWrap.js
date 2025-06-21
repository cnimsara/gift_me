const express = require('express');
const router = express.Router();
const pool = require('./database');

// Display all wrapping options from all sellers

router.get('/MultiWrap', (req, res) => {
  const boxIds = req.query.boxIds; // This will be an array if multiple boxIds sent

  console.log('Received boxIds:', boxIds);

  const wrapQuery = `
    SELECT items.*, sellers.shop_name 
    FROM items 
    JOIN sellers ON items.seller_id = sellers.seller_id 
    WHERE items.category = "wrappingPaper"
  `;

  if (boxIds) {
    const boxIdArray = Array.isArray(boxIds) ? boxIds : [boxIds];
    const placeholders = boxIdArray.map(() => '?').join(',');

    const boxQuery = `
      SELECT items.*, sellers.shop_name
      FROM items
      JOIN sellers ON items.seller_id = sellers.seller_id
      WHERE items.category = "giftbox" AND items.item_id IN (${placeholders})
    `;

    pool.query(boxQuery, boxIdArray, (err, boxes) => {
      if (err) {
    console.error('DB error loading selected boxes:', err);
    return res.send('Error loading selected boxes');
  }
  
      if (err) return res.send('Error loading selected boxes');
console.log('Boxes:', boxes);  // << Add this line to check the shape
      req.session.customBox = {
        boxes: boxes.map(box => ({
          id: box.item_id.toString(),
          price: parseFloat(box.price),
          photo: box.photo1,
          description: box.description,
          sellerId: box.seller_id.toString()
        })),
        total: boxes.reduce((sum, b) => sum + parseFloat(b.price), 0)
      };

      // Then render with wraps and updated customBox in session
      pool.query(wrapQuery, (err, wraps) => {
        if (err) return res.send('Error loading wrapping items');
        res.render('MultiWrap', {
          wraps,
          customBox: req.session.customBox,
          customWrap: req.session.customWrap || { wraps: [], total: 0 },
          isLoggedIn: !!req.session.userId,
          isSeller: req.session.userRole === 'seller'
        });
      });
    });
  } else {
    // No boxIds query, just render normally
    pool.query(wrapQuery, (err, wraps) => {
      if (err) return res.send('Error loading wrapping items');
      res.render('MultiWrap', {
        wraps,
        customBox: req.session.customBox || { boxes: [], total: 0 },
        customWrap: req.session.customWrap || { wraps: [], total: 0 },
        isLoggedIn: !!req.session.userId,
        isSeller: req.session.userRole === 'seller'
      });
    });
  }
});


// Handle multi-wrap selection
// Handle multi-wrap selection
router.post('/selectWraps', (req, res) => {
  const { id, price, photo, description, sellerId } = req.body;

  console.log('Wrap selected with id:', id);  // <-- Add this line to log wrap id

  if (!req.session.customWrap) {
    req.session.customWrap = {
      wraps: [],
      total: 0
    };
  }

  const wrapObj = {
    id,
    price: parseFloat(price),
    photo,
    description,
    sellerId
  };

  // Prevent duplicates
  const alreadySelected = req.session.customWrap.wraps.find(w => w.id === id);
  if (!alreadySelected) {
    req.session.customWrap.wraps.push(wrapObj);
    req.session.customWrap.total += wrapObj.price;
  }

  res.redirect('/MultiWrap');
});

// Remove a selected wrap
router.post('/removeWrap', (req, res) => {
  const { id } = req.body;

  if (req.session.customWrap && req.session.customWrap.wraps) {
    req.session.customWrap.wraps = req.session.customWrap.wraps.filter(w => w.id !== id);
    // Recalculate total
    req.session.customWrap.total = req.session.customWrap.wraps.reduce((sum, w) => sum + w.price, 0);
  }

  res.redirect('back');
});
module.exports = router;
