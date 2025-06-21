// Preview uploaded images
// Photo preview and delete
function previewImage(event, previewId) {
  const preview = document.getElementById(previewId);
  const fileInput = event.target;

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
     preview.innerHTML = `
  <img src="${e.target.result}" alt="Photo" />
  <button type="button" class="delete-btn" title="Remove Photo">&times;</button>
`;

// Delete button functionality
preview.querySelector(".delete-btn").onclick = function (ev) {
  ev.stopPropagation(); // Prevent label click triggering file input
  fileInput.value = ""; // Clear file input
  preview.textContent = preview.getAttribute("data-default-text") || "Photo";
};

    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    preview.textContent = preview.getAttribute("data-default-text") || "Photo";
  }
}
// City options for each country
const cityOptions = {
    "Sri Lanka": ["Colombo", "Kandy", "Galle"],
    "India": ["Delhi", "Mumbai", "Bangalore"],
    "USA": ["New York", "Los Angeles", "Chicago"]
};

// Currency symbols for each country
const currencySymbols = {
    "Sri Lanka": "Rs",
    "India": "₹",
    "USA": "$"
};

// Update cities and currency symbol
function updateCitiesAndCurrency() {
    const countrySelect = document.getElementById("country");
    const selectedCountry = countrySelect.value;

    // Update cities
    const citySelect = document.getElementById("city");
    citySelect.innerHTML = '<option value="">Select City</option>';
    if (selectedCountry && cityOptions[selectedCountry]) {
        cityOptions[selectedCountry].forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }

    // Update all currency symbols
    const currency = currencySymbols[selectedCountry] || "";
    document.getElementById("currencySymbol").textContent = currency;
    document.getElementById("shippingCurrency1").textContent = currency;
    document.getElementById("shippingCurrency2").textContent = currency;
}

// Toggle shipping input fields
function toggleShippingFields() {
    const method = document.getElementById("shippingMethod").value;
    const domestic = document.getElementById("domesticFields");
    const other = document.getElementById("otherFields");

    domestic.style.display = method === "Domestic" ? "block" : "none";
    other.style.display = method === "Other" ? "block" : "none";
}
function calculateShippingCost() {
    const shippingMethod = document.getElementById("shippingMethod").value;
    const weightInput = document.getElementById("weight");
    const domesticCostInput = document.getElementById("domesticCost");

    if (shippingMethod === "Domestic") {
        const weight = parseFloat(weightInput.value);
        if (!isNaN(weight) && weight > 0) {
            const cost = weight * 1;  // 1 Rs per kg
            domesticCostInput.value = cost.toFixed(2);
        } else {
            domesticCostInput.value = '';
        }
    } else {
        domesticCostInput.value = '';
    }
}

// Calculate and show shipping cost for GiftBoxDel (Domestic)
function calculateShippingCost() {
    const shippingMethod = document.getElementById("shippingMethod").value;
    const weightInput = document.getElementById("weight");
    const domesticCostInput = document.getElementById("domesticCost");
    const displayDiv = document.getElementById("shippingCostDisplay");

    if (shippingMethod === "Domestic") {
        const weight = parseFloat(weightInput.value);
        if (!isNaN(weight) && weight > 0) {
            const cost = weight * 1; // 1 Rs per kg
            domesticCostInput.value = cost.toFixed(2);
            displayDiv.textContent = `Shipping Cost: ${cost.toFixed(2)} Rs`;
        } else {
            domesticCostInput.value = '';
            displayDiv.textContent = '';
        }
    } else {
        domesticCostInput.value = '';
        displayDiv.textContent = '';
    }
}

// Event listeners
document.getElementById("shippingMethod").addEventListener("change", () => {
    toggleShippingFields();
    calculateShippingCost();
});

document.getElementById("weight").addEventListener("input", calculateShippingCost);

// public/script/itemDetail.js

function changePhoto(newSrc) {
  const mainPhoto = document.getElementById('main-photo');
  if (mainPhoto) {
    mainPhoto.src = newSrc;
  }
}
