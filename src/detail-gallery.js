export function initProductGallery({ image, title, gender, photoKey, resetZoom }) {
  const gallery = document.querySelector('.detail-gallery');
  const strip = gallery.querySelector('.detail-thumbnails');
  const labels = ['Front view', 'Back view', 'Three-quarter view', 'Front detail', 'Construction detail'];
  const original = `${import.meta.env.BASE_URL}images/products/${photoKey}.png`;
  const additional = `${import.meta.env.BASE_URL}images/products/gallery/${photoKey}.png`;
  const row = gender === 'Women' ? 1 : 0;
  let active = 0;
  function frame(target, index) {
    target.className = index === 0 ? (row ? 'pair-right' : 'pair-left') : 'gallery-sheet';
    target.removeAttribute('style');
    if (index > 0) {
      const column = index - 1;
      target.style.setProperty('--gallery-left', `${-column * 100}%`);
      target.style.setProperty('--gallery-top', `${-row * 100}%`);
      target.style.setProperty('--gallery-origin-x', `${(column + .5) * 25}%`);
      target.style.setProperty('--gallery-origin-y', `${(row + .36) * 50}%`);
    }
    target.src = index === 0 ? original : additional;
  }
  const thumbnails = labels.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';button.className = 'detail-thumb';button.dataset.image = String(index);
    button.setAttribute('aria-label', `View image ${index + 1}: ${label}`);
    button.setAttribute('aria-pressed', String(index === 0));
    const visual = document.createElement('span');visual.className = 'gallery-thumb-visual';
    const thumb = document.createElement('img');thumb.alt = '';thumb.decoding = 'async';frame(thumb,index);
    visual.append(thumb);button.append(visual);strip.append(button);
    button.addEventListener('click', () => select(index));
    return button;
  });
  function select(index, interactive = true) {
    active = (index + labels.length) % labels.length;
    resetZoom();frame(image,active);
    image.alt = `${title} — ${labels[active]}, AI design concept`;
    gallery.dataset.activeImage = String(active);
    thumbnails.forEach((button,i) => button.setAttribute('aria-pressed',String(i === active)));
    gallery.querySelector('.gallery-status').textContent = `${active + 1} / ${labels.length} · ${labels[active]}`;
    if (interactive) {
      const thumb = thumbnails[active].getBoundingClientRect();
      const track = strip.getBoundingClientRect();
      strip.scrollTo({left:strip.scrollLeft + thumb.left - track.left - (strip.clientWidth - thumb.width) / 2,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  gallery.querySelector('.gallery-prev').addEventListener('click', () => select(active - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => select(active + 1));
  gallery.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const keys = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: labels.length - 1 };
    if (!Object.hasOwn(keys,event.key)) return;
    event.preventDefault();select(keys[event.key]);
    if (event.target.closest('.detail-thumb')) thumbnails[active].focus({preventScroll:true});
  });
  let start;
  const photo = gallery.querySelector('.detail-photo');
  photo.addEventListener('touchstart', event => {
    if (event.target.closest('button')) return;
    const touch = event.changedTouches[0];start = {x:touch.clientX,y:touch.clientY};
  },{passive:true});
  photo.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0];const dx = touch.clientX - start.x;const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) select(active + (dx < 0 ? 1 : -1));
    start = undefined;
  },{passive:true});
  photo.addEventListener('touchcancel', () => {start = undefined;},{passive:true});
  select(0,false);
}
