document.addEventListener('DOMContentLoaded', function() {
    // Simulate a server-side variable passed to the front-end (can also be set via session or AJAX request)
    const isLoggedIn = window.isLoggedIn || false; // This should be set in the server response

    // DOM Elements
    const authButtons = document.getElementById("auth-buttons");
    const profileIcon = document.getElementById("profile-icon");

    // Logic to toggle visibility based on login status
    if (isLoggedIn) {
        authButtons.style.display = "none";  // Hide "Sign Up" & "Log In"
        profileIcon.style.display = "block";  // Show profile icon
    } else {
        authButtons.style.display = "block";  // Show "Sign Up" & "Log In"
        profileIcon.style.display = "none";  // Hide profile icon
    }
});
function togglePaymentOptions() {
    const method = document.getElementById("paymentMethod").value;
    const paypalDiv = document.getElementById("paypalDiv");
    const cardDiv = document.getElementById("cardDiv");

    paypalDiv.style.display = method === "paypal" ? "block" : "none";
    cardDiv.style.display = method === "card" ? "block" : "none";
}
if (!user) {
    const user = req.session.user; // Get user from session
    if (!user) {
        return res.redirect('/signin');
    }
}
// deliveryMessage.js

document.addEventListener("DOMContentLoaded", function () {
  const oneSellerBtn = document.getElementById("oneSellerBtn");
  const multiSellerBtn = document.getElementById("multiSellerBtn");
  const messageDiv = document.getElementById("deliveryMessage");

  if (oneSellerBtn && multiSellerBtn && messageDiv) {
    oneSellerBtn.addEventListener("click", function (e) {
      e.preventDefault();
      messageDiv.textContent = "✅ Fast and quick delivery when buying from one seller.";
    });

    multiSellerBtn.addEventListener("click", function (e) {
      e.preventDefault();
      messageDiv.textContent = "⚠️ Delivery may take a few extra days when buying from multiple sellers.";
    });
  }
});
