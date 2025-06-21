
document.addEventListener("DOMContentLoaded", function () {
  const oneSellerBtn = document.getElementById("oneSellerBtn");
  const multiSellerBtn = document.getElementById("multiSellerBtn");
  const messageDiv = document.getElementById("deliveryMessage");

if (oneSellerBtn && multiSellerBtn && messageDiv) {
    oneSellerBtn.addEventListener("mouseover", function () {
      messageDiv.textContent = "✅ Fast and quick delivery when buying from one seller.";
    });

    multiSellerBtn.addEventListener("mouseover", function () {
      messageDiv.textContent = "⚠️ Delivery may take a few extra days when buying from multiple sellers.";
    });

    // Optional: Clear the message when mouse leaves either button
    oneSellerBtn.addEventListener("mouseout", function () {
      messageDiv.textContent = "";
    });

    multiSellerBtn.addEventListener("mouseout", function () {
      messageDiv.textContent = "";
    });
  }
});