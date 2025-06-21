const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // For session handling
const path = require('path');
const signupRouter = require('./models/user');
const signinRouter = require('./models/signin');
const profileRouter = require('./models/profileData');
const connection = require('./models/database');
const flash = require('connect-flash');
const becomeSellerRouter = require('./models/becomeSeller');
const sellerDashRouter = require('./models/sellerDash');
const listanItemRouter = require('./models/ListanItem'); // add this line
const itemDetailRouter = require('./models/ItemDetail');
const sellingListRoutes = require('./models/SellingList'); // Import the selling list routes
const indexRouter = require('./models/index');
const choosesellerRoutes  = require('./models/ChooseSeller'); // Import the choose seller routes
const chooseOneSellRouter = require('./models/ChooseOneSell'); // Adjust path
const chooseGiftBoxRouter = require('./models/ChooseBox'); // Adjust path
const chooseGiftWrapRouter = require('./models/ChooseWrap'); // Adjust path
const chooseItemRouter = require('./models/ChooseItem'); // Adjust path
const chooseviewGiftboxRouter = require('./models/viewGiftbox'); // Adjust path
const createGiftBoxRouter = require('./models/createGiftbox'); // Adjust path
const multiSellerboxRouter = require('./models/MultiSellerBox'); // Adjust path
const multiWrapRouter = require('./models/MultiWrap'); // Adjust path
const multiItemRouter= require('./models/MultiItem'); // Adjust path
const createGiftboxRoutes = require('./models/createGiftbox');
const checkoutRoutes = require('./models/checkout'); // Update path if needed

require('dotenv').config();

const app = express();

// 🔥 Session middleware should be BEFORE any router
app.use(session({
secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true only if using HTTPS
}));
// ✅ Middleware to ensure session.customBox is always available
app.use((req, res, next) => {
  if (!req.session.customBox) {
    req.session.customBox = {
      box: null,
      wrap: null,
      gifts: [],
      total: 0
    };
  }
  next();
});

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 

// Setup flash messages
app.use(flash());

// Routes
app.use('/user', signupRouter); // Sign up route
app.use('/signin', signinRouter); // Sign in route
app.use('/', profileRouter); // Profile data route
app.use('/', becomeSellerRouter); // Become a seller route
app.use('/', sellerDashRouter); // Seller dashboard route
app.use('/', itemDetailRouter); // Item detail route
app.use('/', sellingListRoutes); // Selling list route
app.use('/', indexRouter);
app.use('/', choosesellerRoutes); // Choose seller route
app.use('/', chooseOneSellRouter); // Choose one seller route
// Below your other routes
app.use('/', listanItemRouter); // add this line too
app.use('/', chooseGiftWrapRouter); // Choose gift wrap route

app.use('/', chooseGiftBoxRouter); // Choose gift box route
app.use('/', chooseItemRouter); // Choose item route
app.use('/', createGiftBoxRouter); // Create gift box route
app.use('/', chooseviewGiftboxRouter); // Choose gift busket route
app.use('/', multiSellerboxRouter); // Multi seller box route
app.use('/', multiWrapRouter); // Multi wrap route
app.use('/', multiItemRouter);
app.use('/', createGiftboxRoutes);
app.use('/', checkoutRoutes);
// Middleware to store customization session
app.use((req, res, next) => {
  if (!req.session.customBox) {
    req.session.customBox = {
      box: null,
      wrap: null,
      gifts: [],
      total: 0
    };
  }
  next();
});


// Handle login page
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle sign up page
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signUpPage.html'));
});
// app.get('/ListanItem', (req, res) => {
//   res.render('ListanItem', { item: null }); // <-- pass item as null to avoid error
// });
app.get('/item', (req, res) => {
  // Render the same template as /ListanItem
  res.render('ListanItem', {
    item: null,
    isSeller: req.session.user?.isSeller || false,
    isLoggedIn: !!req.session.user
  });
});
// Become a seller page route
app.get('/becomeSeller', (req, res) => {
    if (!req.session.email) {
        return res.redirect('/signin');
    }
    res.render('becomeSeller', { isLoggedIn: true });
});


// Customer Dashboard route
app.get('/customerDash', (req, res) => {
    const user = req.session.user; // Get user from session

    if (!user) {
        return res.redirect('/signin'); // Redirect to login if user is not logged in
    }

    res.render('customerDash', {
        isLoggedIn: true,
        isSeller: user.isSeller,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        country: user.country || '',
        storeName: user.storeName || '',
        businessEmail: user.businessEmail || '',
        businessDescription: user.businessDescription || '',
        businessCategory: user.businessCategory || '',
        successMessage: req.flash('successMessage'), // Flash success message
    });
});

// Seller Dashboard route
app.get('/sellerDash', (req, res) => {
    const user = req.session.user; // Get user from session

    if (!user) {
        return res.redirect('/signin'); // Redirect to login if user is not logged in
    }

    res.render('sellerDash', {
        isLoggedIn: true,
        isSeller: user.isSeller,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        country: user.country || '',
        storeName: user.storeName || '',
        businessEmail: user.businessEmail || '',
        businessDescription: user.businessDescription || '',
        businessCategory: user.businessCategory || '',
        successMessage: req.flash('successMessage'), // Flash success message
    });
});

app.post('/selectWrap', (req, res) => {
  const { id, price, photo, description } = req.body;

  if (!req.session.customBox) req.session.customBox = { total: 0 };

  // Subtract old wrap price if exists
  if (req.session.customBox.wrap) {
    req.session.customBox.total -= Number(req.session.customBox.wrap.price);
  }

  // Add new wrap
  req.session.customBox.wrap = { id, price: Number(price), photo, description };
  req.session.customBox.total += Number(price);
  res.redirect(`/ChooseWrap/${req.session.sellerId || 1}`); // Replace 1 with logic to track seller

  res.redirect('back');
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/'); // If error, redirect to home page
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/index'); // Redirect to homepage after logging out
    });
});

// POST route for signin (login)
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists in the database (simplified here)
    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.redirect('/signin'); // User not found
        }

        const user = results[0];
        // Check if password matches (simplified here)
        if (user.password === password) {
            req.session.user = user; // Store user info in session
            req.session.isSeller = user.isSeller; // Store seller status in session
            req.session.email = user.email; // Store email for easy check

            return res.redirect('/index'); // Redirect to home/dashboard
        } else {
            return res.redirect('/signin'); // Redirect to login on failure
        }
    });
});

// POST route for signup (register)
// app.post('/user', (req, res) => {
//     const { username, email, password, firstName, lastName } = req.body;

//     // Insert new user into the database (simplified here)
//     connection.query('INSERT INTO users (username, email, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)', 
//     [username, email, password, firstName, lastName], (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.redirect('/user'); // Redirect to signup if error
//         }

//         res.redirect('/signin'); // Redirect to login page after successful signup
//     });
// });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
