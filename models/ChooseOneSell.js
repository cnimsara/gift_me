const express = require('express');
const router = express.Router();
const pool = require('./database');

router.get('/ChooseOneSell', (req, res) => {
  const query = `
    SELECT DISTINCT s.seller_id, s.shop_name
    FROM sellers s
    WHERE EXISTS (
      SELECT 1 FROM items WHERE seller_id = s.seller_id AND category = 'giftbox'
    ) AND EXISTS (
      SELECT 1 FROM items WHERE seller_id = s.seller_id AND category = 'wrappingPaper'
    ) AND EXISTS (
      SELECT 1 FROM items WHERE seller_id = s.seller_id AND category NOT IN ('giftbox', 'wrappingPaper')
    )
  `;

  pool.query(query, (err, sellerResults) => {
    if (err) {
      console.error(err);
      return res.render('ChooseOneSell', {
        sellers: [],
        isLoggedIn: req.session.userId ? true : false,
        isSeller: req.session.userRole === 'seller'
      });
    }

    if (sellerResults.length === 0) {
      return res.render('ChooseOneSell', {
        sellers: [],
        isLoggedIn: req.session.userId ? true : false,
        isSeller: req.session.userRole === 'seller'
      });
    }

    const sellers = [];

    const fetchItems = (index) => {
      if (index >= sellerResults.length) {
        return res.render('ChooseOneSell', {
          sellers,
          isLoggedIn: req.session.userId ? true : false,
          isSeller: req.session.userRole === 'seller'
        });
      }

      const seller = sellerResults[index];
      const sellerId = seller.seller_id;

      pool.query(
        `SELECT * FROM items WHERE seller_id = ? AND category = 'giftbox' LIMIT 3`,
        [sellerId],
        (err, giftboxItems) => {
          if (err) return res.status(500).send('DB error');

          pool.query(
            `SELECT * FROM items WHERE seller_id = ? AND category = 'wrappingPaper' LIMIT 3`,
            [sellerId],
            (err, wrappingItems) => {
              if (err) return res.status(500).send('DB error');

              pool.query(
                `SELECT * FROM items WHERE seller_id = ? AND category NOT IN ('giftbox', 'wrappingPaper') LIMIT 3`,
                [sellerId],
                (err, otherItems) => {
                  if (err) return res.status(500).send('DB error');

                  sellers.push({
                    id: sellerId,
                    name: seller.shop_name,
                    gift_boxes: giftboxItems,
                    wrapping_papers: wrappingItems,
                    gifts: otherItems
                  });

                  fetchItems(index + 1);
                });
            });
        });
    };

    fetchItems(0);
  });
});

module.exports = router;
