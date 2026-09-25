document.addEventListener('DOMContentLoaded', () => {
  loadHomeBrands();
  loadLatestDrops();

  const navbar = document.getElementById('main-navbar') || document.querySelector('.navbar');
  const menu = document.querySelector('#mobile-menu');
  const menuLinks = document.querySelector('.nav-links');

  // 1. Mobile Menu Toggle
  if (menu && menuLinks) {
    menu.addEventListener('click', () => {
      menu.classList.toggle('is-active');
      menuLinks.classList.toggle('active');

      if (navbar) {
        navbar.classList.toggle('mobile-open');
      }
    });
  }
});

function loadHomeBrands() {
  const grid = document.getElementById('home-brand-grid');
  const template = document.getElementById('tpl-brand-card');
  if (!grid || !template) return;

  grid.replaceChildren();

  const sixBrands = brands.slice(0, 6);

  sixBrands.forEach(brand => {
    const clone = template.content.cloneNode(true);
    const img = clone.querySelector('.card-img');
    const name = clone.querySelector('.card-name');
    const card = clone.querySelector('.brand-card');

    img.src = brand.cover;
    img.alt = brand.name;
    name.textContent = brand.name;

    card.addEventListener('click', () => {
      window.location.href = 'hub.html';
    });

    grid.appendChild(clone);
  });
}

function loadLatestDrops() {
  const grid = document.getElementById('home-drops-grid');
  const template = document.getElementById('tpl-drop-card');
  if (!grid || !template) return;

  grid.replaceChildren();

  const sixBrands = brands.slice(0, 6);

  sixBrands.forEach(brand => {
    if (!brand.pieces || brand.pieces.length === 0) return;
    
    const latestDrop = brand.pieces[0];
    const clone = template.content.cloneNode(true);

    const img = clone.querySelector('.drop-img');
    const brandName = clone.querySelector('.drop-card-brand');
    const title = clone.querySelector('.drop-card-title');
    const desc = clone.querySelector('.drop-card-desc');
    const price = clone.querySelector('.drop-card-price');

    img.src = latestDrop.images[0];
    img.alt = latestDrop.name;
    brandName.textContent = brand.name;
    title.textContent = latestDrop.name;
    desc.textContent = latestDrop.desc;
    price.textContent = `R ${latestDrop.price.toFixed(2)}`;

    grid.appendChild(clone);
  });
}

const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });