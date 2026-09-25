let cart = JSON.parse(localStorage.getItem('xhobani_cart')) || [];
let isCheckoutView = false;

document.addEventListener('DOMContentLoaded', () => {
  initHub();
  updateCartUI();
});

function saveCart() {
  localStorage.setItem('xhobani_cart', JSON.stringify(cart));
  updateCartUI();
}

function initHub() {
  const grid = document.getElementById('brand-grid');
  const template = document.getElementById('tpl-hub-brand-card');
  if (!grid || !template) return;

  grid.replaceChildren();

  brands.forEach(brand => {
    const clone = template.content.cloneNode(true);
    const img = clone.querySelector('.card-img');
    const name = clone.querySelector('.card-name');
    const card = clone.querySelector('.brand-card');

    img.src = brand.cover;
    img.alt = brand.name;
    name.textContent = brand.name;

    card.addEventListener('click', () => openShowcase(brand));

    grid.appendChild(clone);
  });
}

function openShowcase(brand) {
  const modal = document.getElementById('showcase-modal');
  const body = document.getElementById('modal-body');
  const headerTpl = document.getElementById('tpl-brand-header');
  const pieceTpl = document.getElementById('tpl-piece-item');

  body.replaceChildren();

  const headerClone = headerTpl.content.cloneNode(true);
  headerClone.querySelector('.owner-headshot').src = brand.ownerImg;
  headerClone.querySelector('.brand-logo-small').src = brand.logo;
  headerClone.querySelector('.brand-title-text').textContent = brand.name;
  headerClone.querySelector('.brand-director-text').textContent = `Creative Director: ${brand.owner}`;
  body.appendChild(headerClone);

  brand.pieces.forEach((piece) => {
    const pieceClone = pieceTpl.content.cloneNode(true);
    const mainImg = pieceClone.querySelector('.main-piece-img');
    const title = pieceClone.querySelector('.piece-title-text');
    const desc = pieceClone.querySelector('.piece-desc-text');
    const price = pieceClone.querySelector('.piece-price-text');
    const thumbRow = pieceClone.querySelector('.thumb-row');
    const sizeSelect = pieceClone.querySelector('.select-size');
    const colorSelect = pieceClone.querySelector('.select-color');
    const customColorField = pieceClone.querySelector('.custom-color-field');
    const customColorInput = pieceClone.querySelector('.custom-color-input');
    const colorError = pieceClone.querySelector('.color-error');
    const addBtn = pieceClone.querySelector('.btn-add-piece');

    mainImg.src = piece.images[0];
    title.textContent = piece.name;
    desc.textContent = piece.desc;
    price.textContent = `R ${piece.price}`;

    piece.images.forEach((imgSrc) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.className = 'thumb';
      thumb.addEventListener('click', () => {
        mainImg.src = imgSrc;
      });
      thumbRow.appendChild(thumb);
    });

    colorSelect.addEventListener('change', () => {
    updateCustomColorField(
      colorSelect,
      customColorField,
      customColorInput,
      colorError
    );
  });

  customColorInput.addEventListener('input', () => {
    if (!customColorInput.value.trim()) {
      colorError.textContent = '';
      return;
    }

    const validation = validateCustomColor(customColorInput.value);
    colorError.textContent = validation.valid ? '' : validation.message;
  });

  addBtn.addEventListener('click', () => {
    let selectedColor = colorSelect.value;

    if (selectedColor === 'Other') {
      const validation = validateCustomColor(customColorInput.value);

      if (!validation.valid) {
        colorError.textContent = validation.message;
        customColorInput.focus();
        return;
      }

      selectedColor = validation.value;
    }

    addToCart(
      piece.name,
      piece.price,
      brand.name,
      sizeSelect.value,
      selectedColor
    );
  });

    body.appendChild(pieceClone);
  });

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeShowcase() {
  document.getElementById('showcase-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function addToCart(name, price, brand, size, color) {
  cart.push({ name, price, brand, size, color });
  saveCart();
  toggleCart(true);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function toggleCart(forceOpen = false) {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  
  if (forceOpen) {
    sidebar.classList.add('open');
    overlay.style.display = 'block';
  } else {
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  }
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total-price');
  const checkoutBtn = document.getElementById('main-checkout-btn');
  const template = document.getElementById('tpl-cart-item');

  if (badge) badge.textContent = cart.length;
  if (!container) return;

  if (isCheckoutView) {
    renderCheckoutSummary();
    return;
  }

  if (checkoutBtn) checkoutBtn.textContent = "PROCEED TO CHECKOUT";
  container.replaceChildren();

  if (cart.length === 0) {
    const emptyP = document.createElement('p');
    emptyP.className = 'empty-msg';
    emptyP.textContent = 'Bag is empty.';
    container.appendChild(emptyP);
    if (totalEl) totalEl.textContent = "R 0.00";
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.cart-item-title').textContent = `${item.name} (${item.size})`;
    clone.querySelector('.cart-item-brand').textContent = `${item.brand} | ${item.color}`;
    clone.querySelector('.cart-item-price').textContent = `R ${item.price.toFixed(2)}`;
    
    clone.querySelector('.remove-item').addEventListener('click', () => removeFromCart(index));
    
    container.appendChild(clone);
  });

  if (totalEl) totalEl.textContent = `R ${total.toFixed(2)}`;
}

function handleCheckoutClick() {
  if (isCheckoutView) {
    isCheckoutView = false;
    updateCartUI();
  } else {
    if (cart.length === 0) return alert("Your bag is empty!");
    isCheckoutView = true;
    renderCheckoutSummary();
  }
}

function renderCheckoutSummary() {
  const container = document.getElementById('cart-items-container');
  const checkoutBtn = document.getElementById('main-checkout-btn');
  const summaryTpl = document.getElementById('tpl-order-summary');
  const cardTpl = document.getElementById('tpl-brand-order-card');

  container.replaceChildren();

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const summaryClone = summaryTpl.content.cloneNode(true);
  
  summaryClone.querySelector('.summary-total').textContent = `Total: R ${total.toFixed(2)}`;
  const brandsListContainer = summaryClone.querySelector('.summary-brands-list');

  const uniqueBrands = [...new Set(cart.map(i => i.brand))];

  uniqueBrands.forEach(brandName => {
    const brandInfo = brands.find(b => b.name === brandName);
    const brandItems = cart.filter(i => i.brand === brandName);
    const brandTotal = brandItems.reduce((sum, i) => sum + i.price, 0);

    const cardClone = cardTpl.content.cloneNode(true);
    cardClone.querySelector('.brand-order-title').textContent = brandName;
    cardClone.querySelector('.brand-order-meta').textContent = `Items: ${brandItems.length} | Subtotal: R ${brandTotal.toFixed(2)}`;
    
    const waBtn = cardClone.querySelector('.wa-btn');
    waBtn.textContent = `SEND ORDER TO ${brandName}`;
    waBtn.addEventListener('click', () => sendWhatsApp(brandName, brandInfo.contact.whatsapp, brandItems));

    brandsListContainer.appendChild(cardClone);
  });

  container.appendChild(summaryClone);
  if (checkoutBtn) checkoutBtn.textContent = "BACK TO BAG";
}

function sendWhatsApp(brandName, brandPhone, items) {
  let message = `*NEW ORDER FROM XHOBANI*%0A%0A`;
  let total = 0;

  items.forEach(item => {
    message += `• *Item:* ${item.name}%0A`;
    message += `  *Size:* ${item.size}%0A`;
    message += `  *Color:* ${item.color}%0A`;
    message += `  *Price:* R${item.price}%0A%0A`;
    total += item.price;
  });

  message += `*Total Subtotal:* R${total}%0A%0A`;
  message += `Please send me payment details and shipping info!`;

  const url = `https://wa.me/${brandPhone.replace(/\D/g, '')}?text=${message}`;
  window.open(url, '_blank');
}

// This is the function and section for the input color
function validateCustomColor(value) {
  const color = value.trim().replace(/\s+/g, ' ');
  const colorPattern = /^[A-Za-z]+(?:[ -][A-Za-z]+){0,3}$/;
  const colorModifiers = new Set([
    'light', 'dark', 'pale', 'bright', 'deep', 'soft', 'muted', 'dusty', 'pastel', 'neon', 'royal',
    'baby', 'sky', 'powder', 'burnt', 'forest', 'off', 'warm', 'cool'
  ]);
  const extraColorNames = new Set([
    'burgundy', 'wine', 'rust', 'copper', 'bronze', 'mustard', 'peach', 'coral', 'salmon', 'rose', 'cream', 'beige', 
    'tan', 'khaki', 'charcoal', 'ivory','plum', 'jade', 'mint', 'aqua', 'turquoise','teal', 'navy', 'lavender', 'lilac','magenta', 'fuchsia', 'crimson', 'scarlet', 'ruby', 'emerald', 'amber', 'ochre', 'chocolate', 'celadon', 'ultramarine'
  ]);

  if (!color) {
    return {
      valid: false,
      message: 'Please enter a color.'
    };
  }

  if (color.length > 30) {
    return {
      valid: false,
      message: 'Color must be 30 characters or less.'
    };
  }

  if (!colorPattern.test(color)) {
    return {
      valid: false,
      message: 'Enter a color name only using letters, spaces, or hyphens.'
    };
  }

  const words = color.toLowerCase().split(/[ -]+/);
  const hasColorName = words.some(word => {
    return extraColorNames.has(word) || CSS.supports('color', word);
  });

  const allWordsAreColorTerms = words.every(word => {
    return colorModifiers.has(word) || extraColorNames.has(word) || CSS.supports('color', word);
  });

  if (!hasColorName || !allWordsAreColorTerms) {
    return {
      valid: false,
      message: 'Please enter a valid color name only.'
    };
  }

  return {
    valid: true,
    value: color
  };
}

function updateCustomColorField(colorSelect, customColorField, customColorInput, colorError) {
  const isCustom = colorSelect.value === 'Other';

  customColorField.hidden = !isCustom;

  if (!isCustom) {
    customColorInput.value = '';
    colorError.textContent = '';
    return;
  }

  customColorInput.focus();
}