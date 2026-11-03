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
