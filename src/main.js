const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', expanded);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation');
}));
document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('select[name="category"]').value = link.dataset.category;
}));
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#inquiry-form').addEventListener('submit', event => {
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
