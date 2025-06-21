const express = require('express');
const router = express.Router();
const pool = require('./database'); 
const ensureLoggedIn = require('../middlewares/auth');

// GET checkout page
router.get('/checkout/:id', ensureLoggedIn, async (req, res) => {
    const customBox = req.session.customBox;

    if (!customBox || !customBox.box || !customBox.wrap || !customBox.items) {
        return res.redirect('/customBox'); // Or wherever the box is built
    }

    // Pass isLoggedIn and isSeller to the EJS template
    res.render('checkout', {
        giftBox: customBox,       
        user: req.session.user,
        isLoggedIn: !!req.session.user,
        isSeller: req.session.user ? req.session.user.isSeller : false
    });
});

// POST checkout to place order
router.post('/checkout', ensureLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { address, phone } = req.body;
        const { box, wrap, items, total } = req.session.customBox;

        // Insert order summary
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, box_id, wrap_id, total_price, address, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [userId, box.id, wrap.id, total, address, phone]
        );

        const orderId = orderResult.insertId;

        // Insert each item in the order
        for (let item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, item_id, price) VALUES (?, ?, ?)',
                [orderId, item.id, item.price]
            );
        }

        // Clear session
        req.session.customBox = null;

        res.redirect(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).send('Something went wrong while placing your order.');
    }
});

// GET success page
router.get('/checkout/success', ensureLoggedIn, (req, res) => {
    res.render('checkoutSuccess', {
        orderId: req.query.orderId,
        user: req.session.user
    });
});

module.exports = router;
