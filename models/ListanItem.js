const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('./database');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// For adding a new item (empty form)
router.get('/item', (req, res) => {
  res.render('ListanItem', {
    item: null, // or {}
    isSeller: req.session.user?.isSeller || false,
    isLoggedIn: !!req.session.user
  });
});

router.post('/ListanItem', upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), (req, res) => {
  // Assuming seller_id is stored on the logged-in user session
const seller_id = req.session.user && req.session.user.seller_id;

  if (!seller_id) {
    return res.status(401).send('Unauthorized: seller not logged in');
  }

  const {
    description,
    category,
    brand,
    itemCondition,
    country,
    city,
    shippingMethod,
    domesticCost,
    otherCost,
    height,
    width,
    weight,
    price
  } = req.body;

  // Validate required fields
  if (!description || !category || !brand || !itemCondition || !country || !city || !shippingMethod || !price) {
    return res.status(400).send('Missing required fields.');
  }

  // Handle uploaded photos
  const photo1 = req.files['photo1'] ? req.files['photo1'][0].filename : null;
  const photo2 = req.files['photo2'] ? req.files['photo2'][0].filename : null;
  const photo3 = req.files['photo3'] ? req.files['photo3'][0].filename : null;

  const query = `
    INSERT INTO items 
    (seller_id, description, category, brand, itemCondition, country, city, shippingMethod, domesticCost, otherCost, height, width, weight, price, photo1, photo2, photo3) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    seller_id,
    description,
    category,
    brand,
    itemCondition,
    country,
    city,
    shippingMethod,
    domesticCost || null,
    otherCost || null,
    height || null,
    width || null,
    weight || null,
    price,
    photo1,
    photo2,
    photo3
  ];

  pool.query(query, params, (err, results) => {
    if (err) {
      console.error('Error inserting item:', err);
      return res.status(500).send('Database error inserting item.');
    }
  res.redirect('/item/' + results.insertId);   });
});

router.post('/item/:id/edit', upload.fields([
  
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), (req, res) => {
  const itemId = req.params.id;
  const {
    description,
    category,
    brand,
    itemCondition,
    country,
    city,
    shippingMethod,
    domesticCost,
    otherCost,
    height,
    width,
    weight,
    price,
    existingPhoto1,
    existingPhoto2,
    existingPhoto3
  } = req.body;
console.log('Uploaded files:', req.files);
console.log('Photo1:', req.files['photo1'] ? req.files['photo1'][0].path : 'Using existing photo1');
console.log('Photo2:', req.files['photo2'] ? req.files['photo2'][0].path : 'Using existing photo2');
console.log('Photo3:', req.files['photo3'] ? req.files['photo3'][0].path : 'Using existing photo3');

  // Get new photo filenames if uploaded, otherwise use existing
  const photo1 = req.files['photo1'] ? req.files['photo1'][0].filename : existingPhoto1;
  const photo2 = req.files['photo2'] ? req.files['photo2'][0].filename : existingPhoto2;
  const photo3 = req.files['photo3'] ? req.files['photo3'][0].filename : existingPhoto3;

  const query = `
    UPDATE items SET
      description = ?, category = ?, brand = ?, itemCondition = ?, country = ?, city = ?,
      shippingMethod = ?, domesticCost = ?, otherCost = ?, height = ?, width = ?, weight = ?,
      price = ?, photo1 = ?, photo2 = ?, photo3 = ?
    WHERE id = ?
  `;

  const params = [
    description, category, brand, itemCondition, country, city,
    shippingMethod, domesticCost || null, otherCost || null,
    height || null, width || null, weight || null,
    price, photo1, photo2, photo3,
    itemId
  ];

  pool.query(query, params, (err, result) => {
    if (err) {
      console.error('Error updating item:', err);
      return res.status(500).send('Failed to update item');
    }
    res.redirect('/item/' + itemId);
  });
});

module.exports = router;
