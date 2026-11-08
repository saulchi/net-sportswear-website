import { collections } from './catalog.js';
const grid = document.querySelector('#product-grid');
let category;
let gender;
let type;
function readFilters() {
  const params = new URLSearchParams(location.search);
  category = Object.hasOwn(collections, params.get('category')) ? params.get('category') : 'SKI';
  gender = ['Men', 'Women'].includes(params.get('gender')) ? params.get('gender') : 'All';
  type = Object.hasOwn(collections[category].types, params.get('subcategory')) ? params.get('subcategory') : 'All';
}
function inquiryUrl(subcategory, fit) {
  const query = new URLSearchParams({ category });
  if (subcategory && subcategory !== 'All') query.set('subcategory', subcategory);
  if (fit && fit !== 'All') query.set('gender', fit);
  return `${import.meta.env.BASE_URL}?${query}#inquiry`;
}
function render() {
  const collection = collections[category];
  document.title = [category, gender !== 'All' ? gender.toUpperCase() : '', type !== 'All' ? type : '', 'NET Sportswear'].filter(Boolean).join(' | ');
  const context = [category, gender !== 'All' ? gender.toUpperCase() : 'MEN & WOMEN', type !== 'All' ? type : 'All products'].join(' / ');
  document.querySelector('#product-context').textContent = context;
  document.querySelector('#product-heading').textContent = type !== 'All' ? type : 'Your collection. Made your way.';
  document.querySelector('#category-title').textContent = category;
  document.querySelector('#category-description').textContent = collection.description;
  document.querySelector('#category-image').src = `${import.meta.env.BASE_URL}images/${collection.image}`;
  document.querySelectorAll('[data-product-category]').forEach(link => {
    if (link.dataset.productCategory === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  grid.replaceChildren();
  let count = 0;
  for (const [name, description] of Object.entries(collection.types)) {
    if (type !== 'All' && name !== type) continue;
    for (const fit of ['Men', 'Women']) {
      if (gender !== 'All' && fit !== gender) continue;
      const card = document.createElement('article');
      card.className = 'product-card';
      card.dataset.gender = fit;
      card.dataset.subcategory = name;
      const label = document.createElement('div'); label.className = 'eyebrow'; label.textContent = `${category} / ${fit}`;
      const number = document.createElement('span'); number.className = 'product-number'; number.textContent = String(++count).padStart(2, '0');
      const title = document.createElement('h3'); title.textContent = name;
      const text = document.createElement('p'); text.textContent = description;
      const note = document.createElement('p'); note.className = 'product-fit'; note.textContent = `${fit} · OEM / ODM development`;
      const link = document.createElement('a'); link.href = inquiryUrl(name, fit); link.textContent = 'Discuss this style';
      card.append(label, number, title, text, note, link); grid.append(card);
    }
  }
  document.querySelector('#product-count').textContent = `${category} · ${count} development ${count === 1 ? 'option' : 'options'} · ${gender === 'All' ? 'Men & Women' : gender}`;
  document.querySelector('#category-inquiry').href = inquiryUrl(type, gender);
  grid.setAttribute('aria-busy', 'false');
}
window.addEventListener('popstate', () => { readFilters(); render(); });
readFilters();
render();
