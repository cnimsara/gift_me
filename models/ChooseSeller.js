const express = require('express');
const router = express.Router();

router.get('/ChooseSeller', (req, res) => {
  const isLoggedIn = req.session && req.session.user;
  const isSeller = req.session && req.session.user && req.session.user.isSeller;

  res.render('ChooseSeller', {
    isLoggedIn,
    isSeller
});
});
module.exports = router;
