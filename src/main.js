import { findUploadedProduct } from './inventory.js';
import { initNavigation } from './navigation.js';
initNavigation();
document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', () => {
  const field = document.querySelector('select[name="category"]');
  if (field) field.value = link.dataset.category;
}));
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#inquiry-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const content = `NET SPORTSWEAR — INQUIRY DRAFT\n\nName: ${data.get('name')}\nWork email: ${data.get('email')}\nCompany: ${data.get('company')}\nProduct interest: ${data.get('category')}\n\nProject details:\n${data.get('message')}\n\nThis is a locally saved draft. It has not been sent to Net Sportswear.\n`;
  const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'net-sportswear-inquiry.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#form-status').textContent = 'Your inquiry draft has been downloaded. Nothing has been sent.';
});


// Autoplay is controlled only by Pause/Play and page visibility.
// Reduced-motion preferences are respected by the CSS transition rules.
const carousel = document.querySelector('.hero');
if (carousel) {
const slides = [...carousel.querySelectorAll('.hero-image')];
const tabs = [...carousel.querySelectorAll('[data-slide]')];
const pauseButton = carousel.querySelector('.hero-pause');
let activeSlide = 0;
let paused = false;
let timer;
function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
  tabs.forEach((tab, i) => {
    tab.classList.toggle('is-active', i === activeSlide);
    tab.setAttribute('aria-pressed', String(i === activeSlide));
  });
}
function scheduleSlides() {
  clearInterval(timer);
  pauseButton.textContent = paused ? 'Play' : 'Pause';
  pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
  if (!paused && !document.hidden) {
    timer = setInterval(() => showSlide(activeSlide + 1), 5000);
  }
}
tabs.forEach((tab, i) => tab.addEventListener('click', () => { showSlide(i); scheduleSlides(); }));
pauseButton.addEventListener('click', () => { paused = !paused; scheduleSlides(); });
document.addEventListener('visibilitychange', scheduleSlides);
let touchStart;
carousel.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
carousel.addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 60) { showSlide(activeSlide + (distance < 0 ? 1 : -1)); scheduleSlides(); }
  touchStart = undefined;
}, { passive: true });
scheduleSlides();

}

// Category-page inquiries arrive with a useful, editable project brief.
const inquiryCategory = document.querySelector('select[name="category"]');
if (inquiryCategory) {
  const params = new URLSearchParams(location.search);
  const product = findUploadedProduct(params.get('product'));
  const category = product?.category ?? params.get('category');
  if (['SKI', 'CYCLING', 'OUTDOOR'].includes(category)) {
    inquiryCategory.value = category;
    const type = product?.subcategory ?? params.get('subcategory');
    const gender = product?.gender ?? params.get('gender');
    const details = [product?.style, category, type, ['Men', 'Women'].includes(gender) ? gender : null].filter(Boolean).join(' / ');
    const preferences = [];
    if (['Charcoal', 'Olive', 'Custom'].includes(params.get('colour'))) preferences.push(`Colour direction: ${params.get('colour')}`);
    if (['XS', 'S', 'M', 'L', 'XL', 'Custom range'].includes(params.get('size'))) preferences.push(`Development size: ${params.get('size')}`);
    document.querySelector('[name="message"]').value = `I would like to discuss ${details} development for our brand.${preferences.length ? `\n${preferences.join('\n')}` : ''}`;
  }
}
