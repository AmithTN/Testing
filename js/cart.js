function addToCart(category) {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
//    const inputs = document.querySelectorAll(`input[data-product]`);
    const inputs = document.querySelectorAll(`input[data-category="${category}"]`);

    inputs.forEach(input => {
        // Get the product's name and price
        const productName = input.dataset.product;
        const price = parseInt(input.dataset.price);

        // Parse the current input value as the new quantity
        const newQuantity = parseInt(input.value);

        // Check if the product already exists in the cart
        const existingProduct = cartData.find(item => item.product === productName);

        if (existingProduct) 
        {
            // If the new quantity is different, update the cart
            if (existingProduct.quantity !== newQuantity) 
            {
                if (newQuantity > 0) 
                {
                    existingProduct.quantity = newQuantity; // Update the quantity
                } 
                else 
                {
                        // Remove the product if the new quantity is 0
                    const productIndex = cartData.indexOf(existingProduct);
                    if (productIndex > -1) 
                    {
                        cartData.splice(productIndex, 1);
                    }
                }
            }
        } 
        else if (newQuantity > 0) 
        {
            // Add a new product to the cart if it doesn't already exist and quantity > 0
            cartData.push({ product: productName, price: price, quantity: newQuantity });
        }
    });

    // Save updated cart data back to localStorage
    localStorage.setItem('cartData', JSON.stringify(cartData));

   displayCartItems();
}


function displayCartItems() {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    const cartItemsContainer = document.getElementById('cart-container');
    const cartItemsContainerMobile = document.getElementById('cart-container-mobile');

    // Ensure cartData is an array
    if (!Array.isArray(cartData)) {
        console.error('cartData is not an array. Initializing as an empty array.');
        cartData = []; 
    }

    // Clear existing items in both containers
    cartItemsContainer.innerHTML = '';
    cartItemsContainerMobile.innerHTML = '';

    // Initialize total variable
    let total = 0;

    // Start building the table structure
    let cartItemHTML = `
    <div style="overflow-x: auto;"> <!-- Enable horizontal scroll for small screens -->
        <table style="width: 100%; table-layout: fixed;"> <!-- Fixed layout to prevent shrinking -->
            <thead>
                <tr>
                    <th style="width: 30%; text-align: left; padding: 8px;">Product</th> <!-- Adjust width as needed -->
                    <th style="width: 20%; text-align: center;">Price</th>
                    <th style="width: 15%; text-align: center;">Quantity</th>
                   
                    <th style="width: 15%; text-align: center;">Action</th>
                </tr>
            </thead>
            <tbody>
`;

// Check if the cart is empty
if (cartData.length === 0) {
    const emptyCartMessage = `
        <div style="font-size: 2em; display: flex; min-height: 150px; align-items: center; justify-content: center;">
            <p style="margin: 0; white-space: nowrap;">🛒 Your cart is empty!</p>
        </div>
          
        <div class="elementor-field-group elementor-field-type-submit" style="text-align: center;">
            <button onclick="window.location.href='menu'" class="elementor-button elementor-button-submit elementor-size-sm">
                Start Shopping
            </button>
        </div>
    `;

    cartItemsContainer.innerHTML = emptyCartMessage;
    cartItemsContainerMobile.innerHTML = emptyCartMessage;
    updateCartQuantity();
    return;
} else {
    cartData.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartItemHTML += `
            <tr>
                <td style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.product}&nbsp;
                </td>
                <td style="text-align: center;"> ₹${item.price}&nbsp;</td>
                <td style="text-align: center;">${item.quantity}&nbsp;</td>
              
                <td style="text-align: center;">
                    <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
                </td>
            </tr>
        `;
    });
}

// Close the table structure
cartItemHTML += `
            </tbody>
        </table>
    </div>
`;

// Add the total and checkout button in the cart-footer section if the cart is not empty
if (cartData.length > 0) {
    cartItemHTML += `
        <div class="cart-footer">
            <h2><strong>Total: ₹${total}</strong></h2>
            <button type="button" class="elementor-button" onclick="window.location.href='checkout';" style="margin-top: 10px;">
                Checkout
            </button>
        </div>
    `;
}

    // Display the table and footer in both desktop and mobile containers
    cartItemsContainer.innerHTML = cartItemHTML;
    cartItemsContainerMobile.innerHTML = cartItemHTML;

    // Store the total in localStorage for access on the checkout page
    localStorage.setItem('cartTotal', total);

    updateCartQuantity(); // Update the cart quantity display
}



// update the cart quantity above Cart Icon 

function updateCartQuantity() {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    const totalQuantity = cartData.reduce((acc, item) => acc + item.quantity, 0); // Calculate total quantity
    
    // Select all elements with the cart quantity display class
    const cartQuantityDisplays = document.querySelectorAll('.elementor-button-icon-qty');
    
    // Update each display with the calculated total quantity
    cartQuantityDisplays.forEach(display => {
        display.textContent = totalQuantity;
    });
}

// Initialize cart on page load

document.addEventListener('DOMContentLoaded', () => {
    /*console.log('DOMContentLoaded event fired'); for error checking purpose*/
    displayCartItems();
    updateCartQuantity(); // Set initial quantity display on page load
});



// Function to remove items from cart

function removeFromCart(index) {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    cartData.splice(index, 1);                                                          // Remove the item at the specified index
    localStorage.setItem('cartData', JSON.stringify(cartData));                        // Update localStorage
    displayCartItems();                                                               // Refresh the cart display
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartSidebarMobile = document.getElementById('cart-sidebar-mobile');
    const isCartOpen = document.body.classList.contains('cart-open');
    
    // Check screen width to apply responsive behavior
    if (window.innerWidth <= 1024) {
        // Mobile screen behavior
        document.body.classList.toggle('cart-open', !isCartOpen);
        cartSidebarMobile.classList.toggle('open');
    } else {
        // Laptop/Desktop screen behavior
        cartSidebar.classList.toggle('open');
    }
}


//Checkout

document.addEventListener('DOMContentLoaded', () => {
    const cartTotalElement = document.getElementById('cart-total');
    const deliveryChargeElement = document.getElementById('delivery-charge');
    const serviceChargeElement = document.getElementById('service-charge');
    const itemTotalElement = document.getElementById('item-total');
    const breakdownDeliveryElement = document.getElementById('breakdown-delivery');

    let cartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;
    let couponApplied = false;
    let discountApplied = 0;
    let previousVeggieCharge = 0;
    let previousDeliverySelection = "";

    const deliveryCharges = {
        "near_to_siragate": 20,
        "near_to_shridevi_college": 30, "near_to_golds_gym": 30, "near_to_Chickpet": 30, "near_to_mandipet": 40,
        "near_to_ss_puram": 40, "near_to_mg_road": 40, "near_to_siddaganga_hospital": 40, "near_to_antharasanahalli": 40,
        "near_to_stadium": 40, "near_to_hanumanthpura": 40, "near_to_caltex": 40,
        "near_to_sit": 50, "near_to_jayanagar": 50, "near_to_sapthagiri_extension": 50, "near_to_banshankri": 50,
        "near_to_upparhalli": 50, "near_to_ssit": 50, "near_to_Danah_palace": 50,
        "near_to_ssmc": 60, "near_to_shettihalli": 60, "near_to_batwadi": 60, "near_to_kyatsandra": 60, "near_to_belagumba": 60
    };

    function splitCharge(total) {
        const delivery = Math.floor(total * 0.8);
        const service = total - delivery;
        return { delivery, service };
    }

    function updateBreakdown(itemTotal, delivery, service) {
        if (itemTotalElement) itemTotalElement.textContent = itemTotal;
        if (breakdownDeliveryElement) breakdownDeliveryElement.textContent = delivery;
        if (serviceChargeElement) serviceChargeElement.textContent = service;
    }

    // Initial load
    cartTotalElement.textContent = cartTotal;

    // Veggies dropdown handling
    const veggiesField = document.getElementById('form-field-veggies');
    veggiesField.addEventListener('change', () => {
        cartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;
        cartTotal -= previousVeggieCharge;

        let newCharge = 0;
        const val = veggiesField.value;
        if (val === "boiled") newCharge = 10;
        else if (val === "steamed") newCharge = 15;
        else if (val === "Fried") newCharge = 20;

        previousVeggieCharge = newCharge;
        cartTotal += newCharge;

        cartTotalElement.textContent = cartTotal;
        localStorage.setItem('cartTotal', cartTotal);
    });

    // Delivery area dropdown handling
    const deliveryField = document.getElementById('form-field-delivery-area');
    deliveryField.addEventListener('change', () => {
        cartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;

        // Remove previous delivery charge
        if (previousDeliverySelection in deliveryCharges) {
            cartTotal -= deliveryCharges[previousDeliverySelection];
        }

        const selectedArea = deliveryField.value;
        let newDeliveryCharge = deliveryCharges[selectedArea] || 0;
        const { delivery, service } = splitCharge(newDeliveryCharge);
        cartTotal += newDeliveryCharge;

        // Update display
        deliveryChargeElement.textContent = delivery;
        if (serviceChargeElement) serviceChargeElement.textContent = service;
        if (itemTotalElement) itemTotalElement.textContent = cartTotal - newDeliveryCharge;
        if (breakdownDeliveryElement) breakdownDeliveryElement.textContent = delivery;
        cartTotalElement.textContent = cartTotal;

        // Save and update
        localStorage.setItem('cartTotal', cartTotal);
        previousDeliverySelection = selectedArea;
    });

    // Coupon Code Handling
    const applyCouponButton = document.getElementById('apply-coupon');
    const couponField = document.getElementById('coupon-code');
    const discounts = {
        "SAVE5": 0.05, "LOYALTY5": 0.05, "FITNOHOLIC5": 0.05, "HULK5": 0.05,
        "POWER5": 0.05, "RAW5": 0.05, "RR5": 0.05, "SAMRAT5": 0.05, "UNIVERSAL5": 0.05,
        "SACHIN5": 0.05, "WASEEM5": 0.05, "PRATHAP5": 0.05, "ARUN5": 0.05
    };

    applyCouponButton.addEventListener('click', () => {
        if (couponApplied) {
            alert("Coupon already applied!");
            return;
        }

        const couponCode = couponField.value.trim().toUpperCase();
        if (couponCode in discounts) {
            const discountPercentage = discounts[couponCode];
            discountApplied = cartTotal * discountPercentage;
            cartTotal -= discountApplied;

            localStorage.setItem('cartTotal', cartTotal);
            cartTotalElement.textContent = cartTotal;

            alert(`Coupon applied! You got a ${discountPercentage * 100}% discount.`);
            couponApplied = true;
        } else {
            alert("Invalid coupon code.");
        }
    });

    // Toggle Charges Breakdown
    const toggleBreakdown = document.getElementById("total-breakdown-toggle");
    if (toggleBreakdown) {
        toggleBreakdown.addEventListener("click", () => {
            const breakdown = document.getElementById("total-breakdown");
            if (breakdown.style.display === "none") {
                breakdown.style.display = "block";
                toggleBreakdown.textContent = "▲ Hide Charges Breakdown";
            } else {
                breakdown.style.display = "none";
                toggleBreakdown.textContent = "▼ View Charges Breakdown";
            }
        });
    }
});
// Select the form using its class
const form = document.querySelector(".elementor-form");

// Function to save form data to localStorage
function saveFormData() {
    const formData = {};
    const formElements = form.elements;

    for (let element of formElements) {
        if (element.name && element.name !== "form_fields[veggies]" && element.name !== "form_fields[delivery_area]") { // Exclude veggies preference
            if (element.type === "checkbox" || element.type === "radio") {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }
    localStorage.setItem("formData", JSON.stringify(formData));
}

// Function to load form data from localStorage
function loadFormData() {
    const savedData = JSON.parse(localStorage.getItem("formData"));
    if (savedData) {
        const formElements = form.elements;
        for (let element of formElements) {
            if (element.name && savedData[element.name] !== undefined && element.name !== "form_fields[veggies]") { // Exclude veggies preference
                if (element.type === "checkbox" || element.type === "radio") {
                    element.checked = savedData[element.name];
                } else {
                    element.value = savedData[element.name];
                }
            }
        }
    }
}


// Save form data on submit
form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent actual form submission for testing
    saveFormData(); // Save data to localStorage
  //  alert("Form data saved!");
});

// Load form data when the page is loaded
document.addEventListener("DOMContentLoaded", loadFormData);

function validateForm() {
    let isValid = true;

    const nameField = document.getElementById('form-field-fullname');
    const phoneField = document.getElementById('form-field-PhoneNo');
    const deliveryareaField = document.getElementById('form-field-delivery-area');
    const addressField = document.getElementById('form-field-address'); 
    const veggiesField = document.getElementById('form-field-veggies');
    const spicyField = document.getElementById('form-field-spicy');
 //   const gymField = document.getElementById('form-field-gym');
    
     

    // Reset previous validity messages
    nameField.setCustomValidity("");
    phoneField.setCustomValidity("");
    deliveryareaField.setCustomValidity("");
    addressField.setCustomValidity("");
    veggiesField.setCustomValidity("");
    spicyField.setCustomValidity("");
 //   gymField.setCustomValidity("");
    
     

    if (!nameField.value.trim()) {
        nameField.setCustomValidity("Please enter your full name.");
        isValid = false;
    }

    if (!phoneField.value.trim()) {
        phoneField.setCustomValidity("Please enter your 10-digit phone number.");
        isValid = false;
    }
    
    if (!deliveryareaField.value.trim()) {
        deliveryareaField.setCustomValidity("Please select your Delivery area.");
        isValid = false;
    }

    if (!addressField.value.trim()) {
        addressField.setCustomValidity("Please enter your address.");
        isValid = false;
    }

    if (!veggiesField.value) {
        veggiesField.setCustomValidity("Please select how you prefer your veggies.");
        isValid = false;
    }
    
    if (!spicyField.value) { 
        spicyField.setCustomValidity("Please select your spicy preference.");
        isValid = false;
    }

/*    if (!gymField.value) {
        gymField.setCustomValidity("Please select a gym preference.");
        isValid = false;
    }
*/
    // **Trigger validation messages immediately**
    nameField.reportValidity();
    phoneField.reportValidity();
    deliveryareaField.reportValidity();
    addressField.reportValidity();
    veggiesField.reportValidity();
    spicyField.reportValidity(); 
 //   gymField.reportValidity();

    // Find the first invalid field and scroll to it
    if (!isValid) {
        document.querySelector(':invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Return overall validation status
    return isValid;
}


//If the cart is modified on one tab, it won't update automatically in another. so adding an event listener for storage to sync the cart:
window.addEventListener('storage', () => {
    displayCartItems();
    updateCartQuantity();
});

// Function to handle the checkout process
function checkout() {
    if (!validateForm()) return;

    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    const totalAmount = localStorage.getItem('cartTotal') || 0;

    if (!cartData.length) {
        alert("Your cart is empty! Please add items before checking out.");
        return;
    }

    const billingDetails = {
        name: document.getElementById('form-field-fullname').value,
        phone: document.getElementById('form-field-PhoneNo').value,
        area: document.getElementById('form-field-delivery-area').value,
        address: document.getElementById('form-field-address').value,
        veggies: document.getElementById('form-field-veggies').value,
        spicy: document.getElementById('form-field-spicy').value,
        coupon: document.getElementById('coupon-code').value,
        gym: document.getElementById('form-field-gym').value,
        message: document.getElementById('form-field-message').value,
        deliverycharges: document.getElementById('delivery-charge').innerText,
    };
    
    // Disable the checkout button
    const checkoutButton = document.getElementById('place_order');
    if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.textContent = "Processing...";
    }

    console.log("Cart Data:", cartData);
    console.log("Billing Details:", billingDetails);
    console.log("Total Amount:", totalAmount);
    
    
    alert("Please wait! Your order is being processed.");
    
    sendEmail(billingDetails, cartData, totalAmount);
}


//Function to send email

function sendEmail(billingDetails, cartData, totalAmount) {
    const templateParams = {
        user_name: billingDetails.name,
        user_phone: billingDetails.phone,
        user_area: billingDetails.area,
        user_address: billingDetails.address,
        user_veggies: billingDetails.veggies,
        user_spicy: billingDetails.spicy,
        coupon_code: billingDetails.coupon,
        user_gym: billingDetails.gym,
        user_message: billingDetails.message,
        delivery_Charges: billingDetails.deliverycharges, 
        cart_data: JSON.stringify(cartData, null, 2),
        total_amount: totalAmount,
    };

    try {
        emailjs
            .send("service_xv2kvlp", "template_eo5yg5e", templateParams)
            .then((response) => {
                alert("Order placed successfully!\n\n Thank you for your purchase!\n\n ");

                console.log("Email sent successfully:", response.status, response.text);

                
                clearCart();
                
                // Re-enable the checkout button
                const checkoutButton = document.getElementById('place_order');
                if (checkoutButton) {
                    checkoutButton.disabled = false;
                    checkoutButton.textContent = "Place Order";
                }
                
            })
            .catch((error) => {
                console.error("Failed to send email:", error);
                alert("We encountered an issue while processing your order.\n\n  Please Contact Admin's ph : 8660739940.");
                
                // Re-enable the checkout button
                const checkoutButton = document.getElementById('place_order');
                if (checkoutButton) {
                    checkoutButton.disabled = false;
                    checkoutButton.textContent = "Place Order";
                }
            });
    } 
    catch (error) {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
        
        // Re-enable the checkout button
        const checkoutButton = document.getElementById('place_order');
        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.textContent = "Place Order";
        }
    }
}

function clearCart() {
    localStorage.removeItem("cartData");
    localStorage.removeItem("cartTotal");
    const cartContainer = document.getElementById("cart-container");
    const cartContainermobile = document.getElementById('cart-container-mobile');

    const cartTotal = document.getElementById("cart-total");

    if (cartContainer) cartContainer.innerHTML = "";
    if (cartContainermobile) cartContainermobile.innerHTML = "";
    if (cartTotal) cartTotal.textContent = "0";

    
   // alert("Thank you for your purchase!\n\n Please complete your payment using the provided phone number via UPI apps.");

    console.log("Triggering payment modal...");

    let whatsappUrl = 'https://api.whatsapp.com/send?phone=918660739940';

    orderConfirmation(whatsappUrl);

}



function orderConfirmation(whatsappUrl) {

    // Retrieve customer name
    const customerName = document.getElementById('form-field-fullname').value;


    let predefinedMessage = `Hi,\nI'm ${customerName}. I would like to get confirmation of my order.`;

    // Append the message to the WhatsApp URL
    const whatsappUrlWithMessage = `${whatsappUrl}&text=${encodeURIComponent(predefinedMessage)}`;

    // Select the text container and update the display message
    const waText = document.querySelector('.wa__btn_popup_txt span');
    const waContainer = document.querySelector('.wa__btn_popup_txt');

       // Apply styles for background and text color
       waContainer.style.backgroundColor = 'black';
       waContainer.style.color = 'white';
       waContainer.style.padding = '10px';
       waContainer.style.borderRadius = '8px';
       waContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
   
    
    // Hide the container briefly to reset visibility
    waContainer.style.visibility = 'hidden';

    // Update the text content with subscription type
    waText.innerHTML = `Click here to receive your order confirmation`;

    // Show the message for a short time before redirecting
    setTimeout(() => {
        waContainer.style.visibility = 'visible';
    }, 100); // Adjust the delay if necessary

    // Delay the redirect to WhatsApp with the custom message
    setTimeout(() => {
        window.location.href = whatsappUrlWithMessage;
    }, 100); // 0.1-second delay before redirecting, adjust as needed
    
}


// Attach checkout function to Place Order button
document.getElementById('place_order').addEventListener('click', (e) => {
    e.preventDefault();
    saveFormData(); // Save form data before checking out
    checkout();
});
