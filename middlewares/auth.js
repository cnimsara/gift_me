
function ensureLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next(); // User is logged in, continue
    } else {
        return res.redirect('/signin'); // Not logged in, redirect to login
    }
}

module.exports = ensureLoggedIn;