const express = require('express');
const router = express.Router();
const pool = require('./database');
const path = require('path');


router.get('/CustomerDash', (req, res) => {
  const email = req.session.email;
  console.log('Email from session:', email); // Check if session is set
  
  if (!email) {
    console.log('No email in session. Redirecting...');
    return res.redirect('/signin');
  }

  const query = 'SELECT * FROM users WHERE email = ?'; // 👈 Make sure "users" is lowercase if your table is lowercase
  
  pool.query(query, [email], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).send('Error retrieving profile data');
    }

    console.log('SQL Results:', results); // 👈 See what SQL is giving back

    if (results.length > 0) {
      const user = results[0];
      console.log('User found:', user); // 👈 See the user object

      res.render('customerDash', {
        email: user.email,
        firstName: user.first_name,  // Make sure the field names match the database
        lastName: user.last_name,
        username: user.username, // 👈 Add this line
        bio: user.bio,
        country: user.country,
        successMessage: req.flash('success') ,// Get the flash message
        isLoggedIn: true, // Set isLoggedIn to true if the user is logged in
        isSeller: req.session.isSeller || false, // ✅ ADD THIS LINE
        activeTab: 'profile' // Set the active tab to "profile"



      });

      req.session.successMessage = ''; // Reset after showing

    } else {
      console.log('No user found with that email.');
      res.status(404).send('User not found');
    }
  });
});

router.post('/updateProfile', (req, res) => {
  const email = req.session.email;
  const { first_name, last_name, bio, country } = req.body;

  if (!email) {
    return res.redirect('/signin'); // If no email in session, redirect to sign-in
  }

  const updateQuery = `
    UPDATE users
    SET first_name = ?, last_name = ?, bio = ?, country = ?
    WHERE email = ?
  `;

  pool.query(updateQuery, [first_name, last_name, bio, country, email], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).send('Error updating profile');
    }

    console.log('Profile updated successfully');
    req.flash('success', 'Your profile has been updated successfully!'); // Use flash message

    res.redirect('/CustomerDash'); // Redirect to dashboard after successful update
  });
});



router.post('/deleteAccount', (req, res) => {
  const email = req.session.email;

  if (!email) {
    return res.redirect('/signin'); // Redirect to signin if no email in session
  }

  // SQL query to delete the user account
  const deleteQuery = 'DELETE FROM users WHERE email = ?';

  pool.query(deleteQuery, [email], (err, result) => {
    if (err) {
      console.error('Error deleting account:', err);
      return res.status(500).send('Error deleting account');
    }

    console.log('Account deleted successfully');
    
    // Destroy session and redirect to the sign-in page
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error logging out');
      }
      res.redirect('/index'); // Redirect to sign-in page after account deletion
    });
  });
});



module.exports = router;
