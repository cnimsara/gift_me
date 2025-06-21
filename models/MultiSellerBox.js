const express = require('express');
const router = express.Router();
const pool = require('./database');

// GET route to show all gift boxes from all sellers
router.get('/MultiSellerBox', (req, res) => {
  // Remove these lines — undefined variable causes errors
  // const giftBoxId = boxResult.insertId;
  // console.log("Generated Gift Box ID:", giftBoxId);
  // req.session.lastGiftBoxId = giftBoxId;

  const query = `
    SELECT items.*, sellers.shop_name
    FROM items
    JOIN sellers ON items.seller_id = sellers.seller_id
    WHERE items.category = 'giftbox'
  `;

  pool.query(query, (err, giftboxes) => {
    if (err) {
      console.error('Error fetching gift boxes:', err);
      return res.send('Error loading gift boxes');
    }

    const customBox = req.session.customBox || { boxes: [], total: 0 };

    res.render('multiSellerBox', {
      giftboxes,
      customBox,
      isLoggedIn: !!req.session.userId,
      isSeller: req.session.userRole === 'seller'
    });
  });
});

router.post('/selectBoxs', (req, res) => {
  const { boxId: id, price, photo, description, sellerId } = req.body;

  if (!req.session.customBox) {
    req.session.customBox = { boxes: [], total: 0 };
  }

  if (!Array.isArray(req.session.customBox.boxes)) {
    req.session.customBox.boxes = [];
  }

  const boxIdStr = String(id);
  const alreadySelected = req.session.customBox.boxes.some(box => box.id === boxIdStr);

  if (!alreadySelected) {
    req.session.customBox.boxes.push({
      id: boxIdStr,
      price: parseFloat(price),
      photo,
      description,
      sellerId: String(sellerId),
    });

    req.session.customBox.total = req.session.customBox.boxes.reduce((sum, box) => sum + box.price, 0);
  }

  res.redirect('/MultiSellerBox');
});

// POST route to remove a selected box
router.post('/removeBoxs', (req, res) => {
  const { id } = req.body;

  if (req.session.customBox && Array.isArray(req.session.customBox.boxes)) {
    req.session.customBox.boxes = req.session.customBox.boxes.filter(box => box.id !== id);
    req.session.customBox.total = req.session.customBox.boxes.reduce((sum, box) => sum + box.price, 0);
  }

  res.redirect('/MultiSellerBox');
});

module.exports = router;
