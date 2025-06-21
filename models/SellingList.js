const express = require('express');
const router = express.Router();
const pool = require('./database');
const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // path of photo uploded
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });


// Middleware to ensure user is logged in and a seller
function ensureSeller(req, res, next) {
  if (req.session.user && req.session.user.isSeller) {
    return next();
  }
  res.redirect('/signin');
}

// GET: Display seller's listed items (if needed separately, use a different EJS)
router.get('/SellingList', ensureSeller, (req, res) => {
  const sellerId = req.session.user.seller_id;

  pool.query(
    'SELECT item_id, description, price, photo1 FROM items WHERE seller_id = ? ORDER BY created_at DESC',
    [sellerId],
    (err, results) => {
      if (err) {
        console.error('Error fetching items:', err);
        return res.status(500).send('Database error.');
      }

      // Render a proper "list view" page, not the upload/edit form
      res.render('SellingList', {
        items: results,
        isLoggedIn: true,
        isSeller: true,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
          activeTab: 'shop' // or whatever tab should be active

      });
    }
  );
});

// GET: Show edit item form using the same form used to list new items (ListanItem.ejs)
router.get('/edit/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const [rows] = await pool.promise().query('SELECT * FROM items WHERE item_id = ?', [itemId]);

    if (rows.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.render('ListanItem', {
      item: rows[0],
      isLoggedIn: true,
      isSeller: true,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      editing: true, // Flag to show "Save Changes" instead of "List Item"
      ActiveTab: 'shop' // Optional: to highlight the active tab in your layout
    });
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).send('Database error');
  }
});

// POST: Update item

 router.post('/edit/:id', upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), async (req, res) => {
  const itemId = req.params.id;
  const {
    description, category, brand, itemCondition,
    country, city, shippingMethod,
    domesticCost, otherCost, height, width, weight, price
  } = req.body;

  // Access uploaded files like this:
  const photos = {
    photo1: req.files.photo1 ? req.files.photo1[0].filename : null,
    photo2: req.files.photo2 ? req.files.photo2[0].filename : null,
    photo3: req.files.photo3 ? req.files.photo3[0].filename : null
  };

  try {
    // Build query dynamically to update photos only if new files were uploaded
    let query = `
      UPDATE items SET 
        description = ?, category = ?, brand = ?, itemCondition = ?, 
        country = ?, city = ?, shippingMethod = ?, 
        domesticCost = ?, otherCost = ?, height = ?, width = ?, weight = ?, 
        price = ?`;

    const params = [
      description, category, brand, itemCondition,
      country, city, shippingMethod,
      domesticCost || null, otherCost || null, height || null, width || null, weight || null,
      price
    ];

    // Append photo updates only if a new photo was uploaded
    if (photos.photo1) {
      query += ', photo1 = ?';
      params.push(photos.photo1);
    }
    if (photos.photo2) {
      query += ', photo2 = ?';
      params.push(photos.photo2);
    }
    if (photos.photo3) {
      query += ', photo3 = ?';
      params.push(photos.photo3);
    }

    query += ' WHERE item_id = ?';
    params.push(itemId);

    await pool.promise().query(query, params);

    res.redirect('/SellingList');
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).send('Database error');
  }
});


// DELETE route (optional, for handling item deletion via POST or JS)
router.post('/delete/:id', ensureSeller, (req, res) => {
  const itemId = req.params.id;
  const sellerId = req.session.user.seller_id;

  // Step 1: Delete gift_box_items that belong to gift_boxes linked to this item
  const deleteGiftBoxItemsQuery = `
    DELETE gi FROM gift_box_items gi
    JOIN gift_boxes gb ON gi.gift_box_id = gb.gift_box_id
    WHERE gb.gift_box_item_id = ?
  `;

  pool.query(deleteGiftBoxItemsQuery, [itemId], (err) => {
    if (err) {
      console.error('Error deleting gift box items:', err);
      return res.status(500).send('Error deleting related gift box items.');
    }

    // Step 2: Delete gift_boxes linked to this item
    pool.query('DELETE FROM gift_boxes WHERE gift_box_item_id = ?', [itemId], (err) => {
      if (err) {
        console.error('Error deleting gift boxes:', err);
        return res.status(500).send('Error deleting related gift boxes.');
      }

      // Step 3: Delete the item itself
      pool.query(
        'DELETE FROM items WHERE item_id = ? AND seller_id = ?',
        [itemId, sellerId],
        (err) => {
          if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).send('Error deleting item.');
          }

          res.redirect('/SellingList');
        }
      );
    });
  });
});



module.exports = router;
