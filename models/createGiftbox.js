const express = require('express');
const router = express.Router();
const pool = require('./database');

router.post('/createGiftbox', async (req, res) => {
  console.log('req.body:', req.body);
  const userId = req.session.userId;
  if (!userId) return res.status(401).send("Not logged in");

  let { itemIds, itemPrices, sellerIds, boxId, wrapId, totalPrice } = req.body;

  // Log raw inputs for debugging
  console.log('Received itemIds:', itemIds);
  console.log('Received itemPrices:', itemPrices);
  console.log('Received sellerIds:', sellerIds);
  console.log('boxId:', boxId, 'wrapId:', wrapId, 'totalPrice:', totalPrice);

  if (!itemIds || (Array.isArray(itemIds) && itemIds.length === 0)) {
    return res.status(400).send("Missing selected items");
  }
  if (!boxId || !wrapId || !totalPrice) {
    return res.status(400).send("Missing gift box details");
  }

  const totalPriceNum = parseFloat(totalPrice);
  if (isNaN(totalPriceNum)) return res.status(400).send("Invalid total price");

  // Normalize to arrays if single values are passed
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  const prices = Array.isArray(itemPrices) ? itemPrices : [itemPrices];
  const sellers = Array.isArray(sellerIds) ? sellerIds : [sellerIds];

  if (ids.length !== prices.length || ids.length !== sellers.length) {
    return res.status(400).send("Mismatched items, prices, or sellers");
  }

  const conn = await pool.promise().getConnection();
  try {
    await conn.beginTransaction();

    // Insert main gift box record
    const [boxResult] = await conn.execute(
      `INSERT INTO gift_boxes (customer_id, gift_box_item_id, wrap_item_id, total_price)
       VALUES (?, ?, ?, ?)`,
      [userId, boxId, wrapId, totalPriceNum]
    );
    const giftBoxId = boxResult.insertId;

    // Insert each selected item in gift_box_items
    for (let i = 0; i < ids.length; i++) {
      const price = parseFloat(prices[i]);
      if (isNaN(price)) {
        await conn.rollback();
        return res.status(400).send("Invalid item price");
      }
      await conn.execute(
        `INSERT INTO gift_box_items (gift_box_id, item_id, seller_id, item_price)
         VALUES (?, ?, ?, ?)`,
        [giftBoxId, ids[i], sellers[i], price]
      );
    }

    await conn.commit();
    console.log(`Gift box ${giftBoxId} created successfully`);
    res.redirect(`/viewGiftbox/${giftBoxId}`);
  } catch (err) {
    await conn.rollback();
    console.error('Error saving gift box:', err);
    res.status(500).send("Error saving gift box");
  } finally {
    conn.release();
  }
});

module.exports = router;
