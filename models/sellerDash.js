const express = require('express');
const router = express.Router();
const pool = require('./database'); // Make sure this points to your MySQL connection file

router.get('/ListanItem', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  res.render('ListanItem', { 
    
    isLoggedIn: true, 
    isSeller: req.session.user.isSeller || false // pass seller status here
  });
});


// GET seller dashboard
router.get('/SellerDash', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/signin');
    }
    try {
        const userId = req.session.user.id;

        const [rows] = await pool.promise().query(`
            SELECT seller_id, shop_name, category, description, payment_method,
                   RIGHT(card_number, 4) AS last_four
            FROM sellers
            WHERE user_id = ?
        `, [userId]);

        if (!rows.length) return res.redirect('/sellerForm'); // redirect if no shop yet

        const seller = rows[0];
        res.render('SellerDash', {
            user: req.session.user, // Pass the user object to the view
            sellerId: seller.seller_id,
            shopName: seller.shop_name,
            category: seller.category,
            shopDetails: seller.description,
            paymentMethod: seller.payment_method,
            lastFourDigits: seller.last_four,
            successMessage: req.flash('success')[0] || '',
            activeTab: 'shop'
        });
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


// POST update seller shop info
router.post('/updateShop', async (req, res) => {
    const { shop_name, category, description } = req.body;
    const userId = req.session.user.id;

    try {
        await pool.promise().query(`
            UPDATE sellers
            SET shop_name = ?, category = ?, description = ?
            WHERE user_id = ?
        `, [shop_name, category, description, userId]);

        req.flash('success', 'Shop details updated successfully.');
        res.redirect('/SellerDash');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
