import { collections, photoKeys } from './catalog.js';
import { uploadedProducts } from './inventory.js';
import { initProductGallery } from './detail-gallery.js';

const params = new URLSearchParams(location.search);
const product = uploadedProducts.find(item => item.style === params.get('product'));
const category = product?.category ?? (Object.hasOwn(collections, params.get('category')) ? params.get('category') : 'OUTDOOR');
const gender = product?.gender ?? (params.get('gender') === 'Women' ? 'Women' : 'Men');
const type = product?.subcategory ?? (Object.hasOwn(collections[category].types, params.get('subcategory')) ? params.get('subcategory') : Object.keys(collections[category].types)[0]);
const names = {Jackets:'Ski Jacket',Pants:'Ski Pants','One-Piece Suits':'One-Piece Ski Suit',Midlayers:'Ski Midlayer','Jackets & Vests':'Cycling Jacket / Vest','Pants & Shorts':category === 'CYCLING' ? 'Cycling Pants / Shorts' : 'Outdoor Pants / Shorts',Jerseys:'Cycling Jersey','Hardshell Jackets':'Hardshell Jacket','Softshell Jackets':'Softshell Jacket','Lightweight Jackets':'Lightweight Jacket','Padded Jackets':'Padded Jacket'};
const title = product?.title ?? `${gender}'s ${names[type]}`;
const selection = new URLSearchParams({category,gender,subcategory:type});
if (product) selection.set('product',product.style);
const collectionUrl = `${import.meta.env.BASE_URL}products.html?${selection}`;
let colour = 'Custom';
let size;

document.title = `${title} | NET Sportswear`;
document.querySelector('#detail-title').textContent = title;
document.querySelector('#detail-category').textContent = `${category} / OEM & ODM`;
document.querySelector('#detail-reference').textContent = product ? `Style number / ${product.style}` : `Concept reference / NET-${photoKeys[category][type].toUpperCase()}-${gender === 'Men' ? 'M' : 'W'}`;
document.querySelector('#detail-description').textContent = product?.description ?? collections[category].types[type];
document.querySelector('#detail-overview').textContent = product ? `${product.style} is one product style. These nine supplied photographs show its colourways, front and back views, interior and details. Final specifications are confirmed separately.` : `${title} — a ${category} development direction for your next collection.`;
document.querySelector('#detail-crumb').textContent = title;
for (const id of ['#detail-back','#detail-browse']) document.querySelector(id).href = collectionUrl;
document.querySelector('#detail-back').textContent = `${category} / ${gender.toUpperCase()}`;
const image = document.querySelector('#detail-image');
image.src = product ? `${import.meta.env.BASE_URL}${product.photos[0].src}` : `${import.meta.env.BASE_URL}images/products/${photoKeys[category][type]}.png`;
image.alt = `${title} — AI-generated design concept`;
image.className = gender === 'Women' ? 'pair-right' : 'pair-left';
function updateInquiry() {
  const query = new URLSearchParams(selection);
  query.set('colour',colour);
  if (size) query.set('size',size);
  document.querySelector('#detail-inquiry').href = `${import.meta.env.BASE_URL}?${query}#inquiry`;
}
document.querySelectorAll('[data-colour]').forEach(button => button.addEventListener('click', () => {
  colour = button.dataset.colour;
  document.querySelectorAll('[data-colour]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
  document.querySelector('#selected-colour').textContent = colour;
  updateInquiry();
}));
document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
  size = size === button.dataset.size ? undefined : button.dataset.size;
  document.querySelectorAll('[data-size]').forEach(item => item.setAttribute('aria-pressed',String(item.dataset.size === size)));
  updateInquiry();
}));
let closeUp = false;
function setView(close) {
  closeUp = close;
  document.querySelector('#detail-photo').classList.toggle('is-close-up',close);
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed',String((button.dataset.view === 'close') === close)));
  const zoom = document.querySelector('.detail-zoom');zoom.setAttribute('aria-pressed',String(close));zoom.setAttribute('aria-label',close ? 'Show full view' : 'Show close-up');zoom.textContent = close ? '−' : '+';
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view === 'close')));
document.querySelector('.detail-zoom').addEventListener('click', () => setView(!closeUp));
initProductGallery({ image, title, gender, photoKey: photoKeys[category][type], resetZoom: () => setView(false), photos: product?.photos });
if (product) {
  document.querySelector('.detail-photo .concept-badge').textContent = product.style;
  document.querySelector('#detail-overview').nextElementSibling.textContent = 'Use this style as a starting point for your project. Fit, trims and branding can be developed around your technical brief.';
  document.querySelector('.detail-image-note').textContent = 'Product photographs supplied for MH0001. All nine images belong to this one style; zoom crops the selected photo.';
}
updateInquiry();
document.querySelector('#product-detail').setAttribute('aria-busy','false');
