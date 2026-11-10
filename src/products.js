import { collections, photoKeys } from './catalog.js';
import { uploadedProducts } from './inventory.js';
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
function inquiryUrl(subcategory, fit, product) {
  const query = new URLSearchParams({ category });
  if (subcategory && subcategory !== 'All') query.set('subcategory', subcategory);
  if (fit && fit !== 'All') query.set('gender', fit);
  if (product) query.set('product',product.style);
  return `${import.meta.env.BASE_URL}?${query}#inquiry`;
}
function render() {
  const collection = collections[category];
  document.title = [category, gender !== 'All' ? gender.toUpperCase() : '', type !== 'All' ? type : '', 'NET Sportswear'].filter(Boolean).join(' | ');
  const context = [category, gender !== 'All' ? gender.toUpperCase() : 'MEN & WOMEN', type !== 'All' ? type : 'All products'].join(' / ');
  document.querySelector('#product-context').textContent = context;
  const fitTitle = gender === 'All' ? '' : `${gender.toUpperCase()}'S `;
  document.querySelector('#product-heading').textContent = `${fitTitle}${category}${type === 'All' ? ' COLLECTION' : ` ${type.toUpperCase()}`}`;
  document.querySelector('#category-description').textContent = type === 'All' ? collection.description : collection.types[type];
  document.querySelectorAll('[data-product-category]').forEach(link => {
    if (link.dataset.productCategory === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  grid.replaceChildren();
  let count = 0;
  let productCount = 0;
  for (const [name, description] of Object.entries(collection.types)) {
    if (type !== 'All' && name !== type) continue;
    for (const fit of ['Men', 'Women']) {
      if (gender !== 'All' && fit !== gender) continue;
      const records = uploadedProducts.filter(item => item.category === category && item.gender === fit && item.subcategory === name);
      for (const product of records.length ? records : [null]) {
      const card = document.createElement('article');
      if (product) {card.dataset.product = product.style;productCount++;}
      card.className = 'product-card';
      card.dataset.gender = fit;
      card.dataset.subcategory = name;
      const photo = document.createElement('a'); photo.className = 'product-visual'; photo.href = `${import.meta.env.BASE_URL}detail.html?${new URLSearchParams({category,gender:fit,subcategory:name})}`;
      if (product) photo.href = `${import.meta.env.BASE_URL}detail.html?product=${encodeURIComponent(product.style)}`;
      photo.setAttribute('aria-label',product ? `View ${product.title}` : `View ${fit}'s ${name}`);
      const image = document.createElement('img');
      image.src = product ? `${import.meta.env.BASE_URL}${product.photos[0].displaySrc ?? product.photos[0].src}` : `${import.meta.env.BASE_URL}images/products/${photoKeys[category][name]}.png`;
      image.alt = product ? `${product.style} — ${product.photos[0].label}` : `${fit}'s ${category} ${name} — AI-generated design concept`;
      image.loading = count < 4 ? 'eager' : 'lazy'; image.decoding = 'async';
      image.className = product ? 'single-photo' : (fit === 'Women' ? 'pair-right' : 'pair-left');
      const badge = document.createElement('span');badge.className = 'concept-badge';badge.textContent = product?.style ?? 'CONCEPT';photo.append(image,badge);
      const info = document.createElement('div');info.className = 'product-info';
      const title = document.createElement('h2');const titleLink = document.createElement('a');titleLink.href = photo.href;titleLink.textContent = product?.title ?? name;title.append(titleLink);
      const note = document.createElement('p');note.className = 'product-fit';note.textContent = `${fit} / ${category}`;
      const link = document.createElement('a');link.href = inquiryUrl(name,fit,product);link.className = 'product-enquire';link.textContent = 'Enquire about this style';
      info.append(title,note,link);card.append(photo,info);grid.append(card);count++;
      }
    }
  }
  const concepts = count - productCount;
  document.querySelector('#product-count').textContent = `[${[productCount ? `${productCount} ${productCount === 1 ? 'product' : 'products'}` : '', concepts ? `${concepts} ${concepts === 1 ? 'concept' : 'concepts'}` : ''].filter(Boolean).join(' · ')}]`;
  document.querySelector('.listing-toolbar > p').textContent = productCount ? (concepts ? 'PRODUCT PHOTOS & LABELLED CONCEPTS · OEM / ODM' : 'PRODUCT PHOTOGRAPHY · OEM / ODM DEVELOPMENT') : 'AI CONCEPT IMAGERY · OEM / ODM DEVELOPMENT';
  document.querySelector('#category-inquiry').href = inquiryUrl(type, gender);
  grid.setAttribute('aria-busy', 'false');
}
window.addEventListener('popstate', () => { readFilters(); render(); });
readFilters();
render();
