// app.js
const rupee = n => `₹${n.toLocaleString('en-IN')}`;

const state = {
    product: {
        id: 'SNK-001',
        title: 'Minimal Runner Sneaker',
        images: [
            { src: 'assets/prod-1.jpg', thumb: 'assets/prod-1-thumb.jpg' },
            { src: 'assets/prod-2.jpg', thumb: 'assets/prod-2-thumb.jpg' },
            { src: 'assets/prod-3.jpg', thumb: 'assets/prod-3-thumb.jpg' },
            { src: 'assets/prod-4.jpg', thumb: 'assets/prod-4-thumb.jpg' },
        ],
        basePrice: 4499,
        variants: {
            color: ['Black', 'White', 'Navy'],
            size: ['UK 7', 'UK 8', 'UK 9', 'UK 10']
        },
        priceAdj: {
            color: { White: 200, Navy: 100, Black: 0 },
            size: { 'UK 10': 150 }
        }
    },
    selected: { color: 'Black', size: 'UK 7', qty: 1 },
    cart: []
};

// Persist cart in localStorage
const CART_KEY = 'demo_cart_v1';
const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
const loadCart = () => { try { state.cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { state.cart = []; } };

// Elements
const mainImage = document.getElementById('mainImage');
const mainImageWrap = document.getElementById('mainImageWrap');
const zoomLens = document.getElementById('zoomLens');
const thumbs = document.querySelectorAll('.thumb');
const priceEl = document.getElementById('price');
const qtyInput = document.getElementById('qty');
const incQty = document.getElementById('incQty');
const decQty = document.getElementById('decQty');
const swatches = document.querySelectorAll('.swatch');
const sizes = document.querySelectorAll('.size');
const addToCart = document.getElementById('addToCart');
const buyNow = document.getElementById('buyNow');
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const backdrop = document.getElementById('backdrop');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

function computePrice() {
    const base = state.product.basePrice;
    const cAdj = state.product.priceAdj.color[state.selected.color] || 0;
    const sAdj = state.product.priceAdj.size[state.selected.size] || 0;
    return base + cAdj + sAdj;
}

function renderPrice() {
    const price = computePrice();
    priceEl.textContent = rupee(price);
    priceEl.setAttribute('data-current', String(price));
}

function setActive(list, btn) {
    list.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-checked', 'false'); });
    btn.classList.add('is-active');
    btn.setAttribute('aria-checked', 'true');
}

function switchImage(src, btn) {
    mainImage.src = src;
    setActive([...thumbs], btn);
}

thumbs.forEach(btn => {
    btn.addEventListener('click', () => switchImage(btn.dataset.src, btn));
});

swatches.forEach(btn => {
    btn.addEventListener('click', () => {
        state.selected.color = btn.dataset.value;
        setActive([...swatches], btn);
        renderPrice();
    });
});

sizes.forEach(btn => {
    btn.addEventListener('click', () => {
        state.selected.size = btn.dataset.value;
        setActive([...sizes], btn);
        renderPrice();
    });
});

incQty.addEventListener('click', () => {
    const n = Math.max(1, (parseInt(qtyInput.value || '1', 10) + 1));
    qtyInput.value = n;
    state.selected.qty = n;
});

decQty.addEventListener('click', () => {
    const n = Math.max(1, (parseInt(qtyInput.value || '1', 10) - 1));
    qtyInput.value = n;
    state.selected.qty = n;
});

qtyInput.addEventListener('input', () => {
    const n = Math.max(1, parseInt(qtyInput.value || '1', 10));
    qtyInput.value = n;
    state.selected.qty = n;
});

// Hover zoom (parallax focus)
mainImageWrap.addEventListener('pointermove', (e) => {
    const rect = mainImageWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mainImage.style.transform = `scale(1.15) translate(${(0.5 - x) * 4}%, ${(0.5 - y) * 4}%)`;
    mainImageWrap.style.setProperty('--x', `${x * 100}%`);
    mainImageWrap.style.setProperty('--y', `${y * 100}%`);
});
mainImageWrap.addEventListener('pointerenter', () => {
    zoomLens.style.opacity = '1';
    mainImage.style.transition = 'transform .06s ease';
});
mainImageWrap.addEventListener('pointerleave', () => {
    zoomLens.style.opacity = '0';
    mainImage.style.transition = 'transform .2s ease';
    mainImage.style.transform = 'scale(1)';
});

// Cart logic
function cartKey(item) {
    return `${item.id}|${item.color}|${item.size}`;
}

function addItemToCart() {
    const price = computePrice();
    const item = {
        id: state.product.id,
        title: state.product.title,
        image: mainImage.src,
        color: state.selected.color,
        size: state.selected.size,
        qty: state.selected.qty,
        price
    };
    const key = cartKey(item);
    const idx = state.cart.findIndex(i => cartKey(i) === key);
    if (idx >= 0) {
        state.cart[idx].qty += item.qty;
    } else {
        state.cart.push(item);
    }
    saveCart();
    renderCart();
    openCart();
}

function removeItem(key) {
    state.cart = state.cart.filter(i => cartKey(i) !== key);
    saveCart(); renderCart();
}

function changeQty(key, delta) {
    const it = state.cart.find(i => cartKey(i) === key);
    if (!it) return;
    it.qty = Math.max(1, it.qty + delta);
    saveCart(); renderCart();
}

function renderCart() {
    cartItems.innerHTML = '';
    let subtotal = 0;
    state.cart.forEach(it => {
        const line = it.qty * it.price;
        subtotal += line;
        const key = cartKey(it);
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
      <img src="${it.image}" alt="${it.title}">
      <div class="item-meta">
        <div>${it.title}</div>
        <div class="muted">${it.color} • ${it.size}</div>
        <div class="item-qty">
          <button aria-label="Decrease">−</button>
          <span>${it.qty}</span>
          <button aria-label="Increase">+</button>
          <button aria-label="Remove" title="Remove" style="margin-left:8px;border-color:rgba(255,255,255,.26)">✕</button>
        </div>
      </div>
      <div class="item-price">${rupee(line)}</div>
    `;
        const [decBtn, incBtn, remBtn] = row.querySelectorAll('.item-qty button');
        decBtn.addEventListener('click', () => changeQty(key, -1));
        incBtn.addEventListener('click', () => changeQty(key, +1));
        remBtn.addEventListener('click', () => removeItem(key));
        cartItems.appendChild(row);
    });
    cartSubtotal.textContent = rupee(subtotal);
    cartCount.textContent = String(state.cart.reduce((n, i) => n + i.qty, 0));
}

function openCart() {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
addToCart.addEventListener('click', addItemToCart);
buyNow.addEventListener('click', () => {
    addItemToCart();
    // Replace with your real checkout route
    alert('Proceeding to checkout…');
});

// Init
loadCart();
renderCart();
renderPrice();
