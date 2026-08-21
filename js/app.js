const cart = [];

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const closeCartButton = document.getElementById("closeCartButton");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutForm = document.getElementById("checkoutForm");
const overlay = document.getElementById("overlay");

function parsePrice(text) {
  const cleaned = String(text).replace(/[^\d.]/g, "");
  return Number(cleaned) || 0;
}

function formatPrice(value) {
  return `${value.toLocaleString("en-US")} IQD`;
}

function getMealFromCard(button) {
  const card = button.closest(".meal-card");

  return {
    id: String(button.dataset.mealId),
    name: card.querySelector("h3").textContent.trim(),
    price: parsePrice(card.querySelector(".meal-price").textContent),
    quantity: 1
  };
}

function addToCart(meal) {
  const existing = cart.find((item) => item.id === meal.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(meal);
  }

  renderCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find((meal) => meal.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    const index = cart.findIndex((meal) => meal.id === id);
    cart.splice(index, 1);
  }

  renderCart();
}

function removeFromCart(id) {
  const index = cart.findIndex((meal) => meal.id === id);

  if (index !== -1) {
    cart.splice(index, 1);
    renderCart();
  }
}

function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function renderCart() {
  cartCount.textContent = getCartQuantity();
  cartTotal.textContent = formatPrice(getCartTotal());

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-cart-message">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-top">
            <div>
              <p class="cart-item-name">${item.name}</p>
              <small>${formatPrice(item.price)}</small>
            </div>
          </div>

          <div class="cart-item-controls">
            <button type="button" class="quantity-minus" data-id="${item.id}">−</button>
            <strong>${item.quantity}</strong>
            <button type="button" class="quantity-plus" data-id="${item.id}">+</button>
            <button type="button" class="remove-item" data-id="${item.id}">×</button>
          </div>
        </div>
      `
    )
    .join("");
}

function openCart() {
  cartPanel.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(getMealFromCard(button));
  });
});

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const id = button.dataset.id;

  if (button.classList.contains("quantity-plus")) {
    changeQuantity(id, 1);
  }

  if (button.classList.contains("quantity-minus")) {
    changeQuantity(id, -1);
  }

  if (button.classList.contains("remove-item")) {
    removeFromCart(id);
  }
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  closeCart();

  document.getElementById("checkout").scrollIntoView({
    behavior: "smooth"
  });
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Please add at least one meal to your cart.");
    return;
  }

  const customer = Object.fromEntries(
    new FormData(checkoutForm).entries()
  );

  const orderPayload = {
    customer,
    items: cart,
    total: getCartTotal(),
    currency: "IQD"
  };

  console.log("Lean Bite order ready for Odoo:", orderPayload);

  alert("Order is ready for the Odoo integration step.");
});

renderCart();
