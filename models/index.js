const express = require('express');
const router = express.Router();
const pool = require('./database');

// Route for homepage (random items)
router.get('/', (req, res) => {
    const isLoggedIn = req.session.email ? true : false;
    const isSeller = req.session.isSeller ? true : false;

    const query = `
        SELECT item_id, description, price, photo1 
        FROM items 
        ORDER BY RAND() 
        LIMIT 3
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching random items:', err);
            return res.status(500).send('Error loading items');
        }

        // Ensure price is numeric
        const items = results.map(item => ({
            ...item,
            price: parseFloat(item.price)
        }));

        res.render('index', {
            isLoggedIn,
            isSeller,
            items
        });
    });
});

// Optional: add /index route to redirect to /
router.get('/index', (req, res) => {
    res.redirect('/');
});

module.exports = router;
