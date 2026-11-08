const collections = {
  SKI: {
    image: 'ski.png', description: 'Confidence on the mountain. A collection built around your brand.',
    types: {
      'Jackets': 'Develop shell and insulated jacket concepts around your intended conditions.',
      'Pants': 'Refine movement, layering room and construction for days on the mountain.',
      'One-Piece Suits': 'Explore coordinated coverage, fit and functional details in one silhouette.',
      'Midlayers': 'Develop versatile layering pieces with your preferred fabrics and finish.',
    },
  },
  CYCLING: {
    image: 'cycling.png', description: 'Designed for movement. Developed for the way your customers ride.',
    types: {
      'Jackets & Vests': 'Explore adaptable outer layers, packability and riding-position fit.',
      'Pants & Shorts': 'Develop cycling bottoms around fit, comfort and your construction brief.',
      'Jerseys': 'Refine fabric selection, pocket layouts and branding for your next collection.',
    },
  },
  OUTDOOR: {
    image: 'hero.png', description: 'Ready for the elements. Purposeful apparel for the paths ahead.',
    types: {
      'Hardshell Jackets': 'Discuss protective shell construction, fabric options and finishing details.',
      'Softshell Jackets': 'Explore flexible outer layers balancing movement and everyday versatility.',
      'Lightweight Jackets': 'Develop light, packable layers for changing conditions and active use.',
      'Padded Jackets': 'Align on insulation options, silhouette and layering requirements.',
      'Pants & Shorts': 'Build versatile bottoms around mobility, fit and practical details.',
    },
  },
};
const grid = document.querySelector('#product-grid');
const typeFilter = document.querySelector('#subcategory');
const genderButtons = [...document.querySelectorAll('[data-gender]')];
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
  document.title = `${category} — OEM / ODM Collections | NET Sportswear`;
  document.querySelector('#category-title').textContent = category;
  document.querySelector('#category-description').textContent = collection.description;
  document.querySelector('#category-image').src = `${import.meta.env.BASE_URL}images/${collection.image}`;
  document.querySelectorAll('[data-product-category]').forEach(link => {
    if (link.dataset.productCategory === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  typeFilter.replaceChildren(new Option('All product types', 'All'), ...Object.keys(collection.types).map(name => new Option(name, name)));
  typeFilter.value = type;
  genderButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gender === gender)));
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
  document.querySelector('#product-count').textContent = `${category} · ${count} development options · ${gender === 'All' ? 'Men & Women' : gender}`;
  document.querySelector('#category-inquiry').href = inquiryUrl(type, gender);
}
function updateFilters() {
  const params = new URLSearchParams({ category });
  if (gender !== 'All') params.set('gender', gender);
  if (type !== 'All') params.set('subcategory', type);
  history.pushState(null, '', `?${params}`);
  render();
}
genderButtons.forEach(button => button.addEventListener('click', () => { gender = button.dataset.gender; updateFilters(); }));
typeFilter.addEventListener('change', () => { type = typeFilter.value; updateFilters(); });
document.querySelector('.filter-reset').addEventListener('click', () => { gender = 'All'; type = 'All'; updateFilters(); });
window.addEventListener('popstate', () => { readFilters(); render(); });
readFilters();
render();
