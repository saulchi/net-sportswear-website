import { collections } from './catalog.js';
const photoKeys = {
  SKI: {Jackets:'ski-jackets',Pants:'ski-pants','One-Piece Suits':'ski-suits',Midlayers:'ski-midlayers'},
  CYCLING: {'Jackets & Vests':'cycling-jackets','Pants & Shorts':'cycling-bottoms',Jerseys:'cycling-jerseys'},
  OUTDOOR: {'Hardshell Jackets':'outdoor-hardshell','Softshell Jackets':'outdoor-softshell','Lightweight Jackets':'outdoor-lightweight','Padded Jackets':'outdoor-padded','Pants & Shorts':'outdoor-bottoms'},
};
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
  const fitTitle = gender === 'All' ? '' : `${gender.toUpperCase()}'S `;
  document.querySelector('#product-heading').textContent = `${fitTitle}${category}${type === 'All' ? ' COLLECTION' : ` ${type.toUpperCase()}`}`;
  document.querySelector('#category-description').textContent = type === 'All' ? collection.description : collection.types[type];
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
      const photo = document.createElement('a'); photo.className = 'product-visual'; photo.href = inquiryUrl(name, fit);
      photo.setAttribute('aria-label', `Discuss ${fit}'s ${name}`);
      const image = document.createElement('img');
      image.src = `${import.meta.env.BASE_URL}images/products/${photoKeys[category][name]}.png`;
      image.alt = `${fit}'s ${category} ${name} — AI-generated design concept`;
      image.loading = count < 4 ? 'eager' : 'lazy'; image.decoding = 'async';
      image.className = fit === 'Women' ? 'pair-right' : 'pair-left';
      const badge = document.createElement('span');badge.className = 'concept-badge';badge.textContent = 'CONCEPT';photo.append(image,badge);
      const info = document.createElement('div');info.className = 'product-info';
      const title = document.createElement('h2');title.textContent = name;
      const note = document.createElement('p');note.className = 'product-fit';note.textContent = `${fit} / ${category}`;
      const link = document.createElement('a');link.href = inquiryUrl(name,fit);link.className = 'product-enquire';link.textContent = 'Enquire about this style';
      info.append(title,note,link);card.append(photo,info);grid.append(card);count++;
    }
  }
  document.querySelector('#product-count').textContent = `[${count} ${count === 1 ? 'concept' : 'concepts'}]`;
  document.querySelector('#category-inquiry').href = inquiryUrl(type, gender);
  grid.setAttribute('aria-busy', 'false');
}
window.addEventListener('popstate', () => { readFilters(); render(); });
readFilters();
render();
