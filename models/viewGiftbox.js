const express = require('express');
const router = express.Router();
const pool = require('./database'); // your MySQL pool connection

// GET /viewGiftbox/:id
router.get('/viewGiftbox/:id', async (req, res) => {
  const giftBoxId = req.params.id;

  try {
    const conn = await pool.promise().getConnection();

    // Get main gift box details (including box and wrap info)
  const [giftBoxRows] = await conn.execute(
  `SELECT gb.gift_box_id,
          gb.total_price,
          box.brand AS box_brand,
          box.price AS box_price,
          wrap.brand AS wrap_brand,
          wrap.price AS wrap_price
   FROM gift_boxes gb
   JOIN items box ON gb.gift_box_item_id = box.item_id
   JOIN items wrap ON gb.wrap_item_id = wrap.item_id
   WHERE gb.gift_box_id = ?`,
  [giftBoxId]
);


    if (giftBoxRows.length === 0) {
      conn.release();
      return res.status(404).send('Gift box not found');
    }
   const giftBox = {
  id: giftBoxRows[0].gift_box_id,
  brand: giftBoxRows[0].box_brand,
  price: giftBoxRows[0].box_price,
  wrapBrand: giftBoxRows[0].wrap_brand,
  wrapPrice: giftBoxRows[0].wrap_price,
  totalPrice: giftBoxRows[0].total_price
};

    // Get all items inside the gift box
  // Get all items inside the gift box with image and seller name
  const [itemsRows] = await conn.execute(
  `SELECT i.brand, i.price, i.photo1, s.shop_name
   FROM gift_box_items gbi
   JOIN items i ON gbi.item_id = i.item_id
   JOIN sellers s ON i.seller_id = s.seller_id
   WHERE gbi.gift_box_id = ?`,
  [giftBoxId]
);


    conn.release();

    res.render('viewGiftbox', {
      giftBox: {
        id: giftBox.id,
        brand: giftBox.brand,
        price: giftBox.price
      },
      giftWrap: {
        brand: giftBox.wrapBrand,
        price: giftBox.wrapPrice
      },
      items: itemsRows,
      total: giftBox.totalPrice,
      isLoggedIn: req.session.userId != null,
      isSeller: req.session.isSeller || false
    });
  } catch (err) {
    console.error('Error loading gift box:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
